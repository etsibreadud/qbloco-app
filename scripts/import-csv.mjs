#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env para importar CSV.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const csvPath = process.argv[2];
if (!csvPath) {
  console.error("Uso: npm run import:csv -- ./data/blocos.csv");
  process.exit(1);
}

const file = fs.readFileSync(path.resolve(csvPath), "utf8");
const records = parse(file, {
  columns: true,
  skip_empty_lines: true,
  trim: true,
});

const audienceCache = new Map();

async function ensureAudience(name) {
  const key = name.toLowerCase();
  if (audienceCache.has(key)) return audienceCache.get(key);
  const { data, error } = await supabase.from("audiences").upsert({ slug: key, name }, { onConflict: "slug" }).select("id").single();
  if (error) throw error;
  audienceCache.set(key, data.id);
  return data.id;
}

async function upsertBlock(row) {
  const audiences = (row.audiences || "").split(";").map((s) => s.trim()).filter(Boolean);
  const audienceIds = [];
  for (const a of audiences) {
    const id = await ensureAudience(a);
    audienceIds.push(id);
  }

  const blockPayload = {
    id: row.id || undefined,
    name: row.name,
    date: row.date,
    time: row.time,
    neighborhood: row.neighborhood,
    metro: row.metro,
    expected_crowd: row.expected_crowd || "medium",
    rating: Number(row.rating || 0),
    review_count: Number(row.review_count || 0),
    source: row.source || null,
    observations: row.observations || null,
  };

  const { data, error } = await supabase.from("blocos").upsert(blockPayload).select("id").single();
  if (error) throw error;
  const blocoId = data.id;

  // clean join table
  await supabase.from("bloco_audiences").delete().eq("bloco_id", blocoId);
  if (audienceIds.length) {
    const rows = audienceIds.map((audienceId) => ({ bloco_id: blocoId, audience_id: audienceId }));
    const { error: joinError } = await supabase.from("bloco_audiences").upsert(rows);
    if (joinError) throw joinError;
  }
}

(async () => {
  for (const row of records) {
    try {
      await upsertBlock(row);
      console.log(`✔️  Importado: ${row.name}`);
    } catch (e) {
      console.error("Falha ao importar", row.name, e.message);
    }
  }
})();
