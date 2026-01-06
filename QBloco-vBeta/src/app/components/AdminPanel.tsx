import { useState } from "react";
import type { Block } from "./BlockCard";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { supabase, hasSupabaseConfig } from "../lib/supabaseClient";
import { toast } from "sonner";

interface AdminPanelProps {
  blocks: Block[];
  onRefresh: () => void;
}

export function AdminPanel({ blocks, onRefresh }: AdminPanelProps) {
  const [form, setForm] = useState({
    id: "",
    name: "",
    date: "",
    time: "",
    neighborhood: "",
    metro: "",
    expectedCrowd: "medium",
    audiences: "",
    rating: "4.5",
    source: "",
    observations: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const fillFromBlock = (blockId: string) => {
    const b = blocks.find((x) => x.id === blockId);
    if (!b) return;
    setForm({
      id: b.id,
      name: b.name,
      date: b.date,
      time: b.time,
      neighborhood: b.neighborhood,
      metro: b.metro,
      expectedCrowd: b.expectedCrowd,
      audiences: (b.audiences || []).join(","),
      rating: String(b.rating || 0),
      source: b.source || "",
      observations: b.observations || "",
    });
  };

  const saveBlock = async () => {
    if (!hasSupabaseConfig) {
      toast.error("Configure o Supabase para salvar blocos pelo admin.");
      return;
    }
    if (!form.name || !form.date || !form.time || !form.neighborhood) {
      toast.error("Preencha nome, data, horário e bairro.");
      return;
    }
    setIsSaving(true);
    const payload = {
      id: form.id || undefined,
      name: form.name,
      date: form.date,
      time: form.time,
      neighborhood: form.neighborhood,
      metro: form.metro,
      expected_crowd: form.expectedCrowd,
      audience: form.audiences
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      rating: Number(form.rating) || 0,
      source: form.source || null,
      observations: form.observations || null,
    };

    const { error } = await supabase.from("blocos").upsert(payload);
    setIsSaving(false);
    if (error) {
      toast.error(error.message || "Erro ao salvar bloco.");
      return;
    }
    toast.success("Bloco salvo com sucesso.");
    onRefresh();
  };

  const deleteBlock = async () => {
    if (!hasSupabaseConfig) {
      toast.error("Configure o Supabase para excluir blocos.");
      return;
    }
    if (!form.id) {
      toast.error("Selecione um bloco na lista para excluir.");
      return;
    }
    setIsSaving(true);
    const { error } = await supabase.from("blocos").delete().eq("id", form.id);
    setIsSaving(false);
    if (error) {
      toast.error(error.message || "Erro ao excluir bloco.");
      return;
    }
    toast.success("Bloco removido.");
    onRefresh();
  };

  return (
    <div className="mt-5 space-y-4">
      <div className="rounded-3xl border border-purple-100 bg-purple-50/60 p-4">
        <div className="text-sm font-bold text-gray-900 mb-3">Editar bloco</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="select-block" className="text-xs uppercase text-gray-600">Carregar existente</Label>
            <select
              id="select-block"
              onChange={(e) => fillFromBlock(e.target.value)}
              className="w-full rounded-2xl border border-purple-100 bg-white px-3 py-2 text-sm"
              defaultValue=""
            >
              <option value="">Novo bloco</option>
              {blocks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="block-id" className="text-xs uppercase text-gray-600">ID (url-amigável)</Label>
            <Input
              id="block-id"
              value={form.id}
              onChange={(e) => setForm((prev) => ({ ...prev, id: e.target.value }))}
              placeholder="ex.: bloco-alegre"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <div>
            <Label htmlFor="block-name">Nome</Label>
            <Input id="block-name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          </div>
          <div>
            <Label htmlFor="block-rating">Avaliação</Label>
            <Input
              id="block-rating"
              type="number"
              step="0.1"
              value={form.rating}
              onChange={(e) => setForm((p) => ({ ...p, rating: e.target.value }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
          <div>
            <Label>Data</Label>
            <Input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} />
          </div>
          <div>
            <Label>Horário</Label>
            <Input value={form.time} onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))} />
          </div>
          <div>
            <Label>Lotação</Label>
            <select
              className="w-full rounded-2xl border border-purple-100 bg-white px-3 py-2 text-sm"
              value={form.expectedCrowd}
              onChange={(e) => setForm((p) => ({ ...p, expectedCrowd: e.target.value }))}
            >
              <option value="low">Tranquilo</option>
              <option value="medium">Moderado</option>
              <option value="high">Lotado</option>
              <option value="very-high">Mega lotado</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <div>
            <Label>Bairro</Label>
            <Input value={form.neighborhood} onChange={(e) => setForm((p) => ({ ...p, neighborhood: e.target.value }))} />
          </div>
          <div>
            <Label>Metrô</Label>
            <Input value={form.metro} onChange={(e) => setForm((p) => ({ ...p, metro: e.target.value }))} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <div>
            <Label>Públicos (separados por vírgula)</Label>
            <Input value={form.audiences} onChange={(e) => setForm((p) => ({ ...p, audiences: e.target.value }))} />
          </div>
          <div>
            <Label>Fonte / link</Label>
            <Input value={form.source} onChange={(e) => setForm((p) => ({ ...p, source: e.target.value }))} />
          </div>
        </div>

        <div className="mt-3">
          <Label>Observações</Label>
          <Textarea
            value={form.observations}
            onChange={(e) => setForm((p) => ({ ...p, observations: e.target.value }))}
            rows={3}
          />
        </div>

        <div className="mt-4 flex gap-3">
          <Button onClick={saveBlock} disabled={isSaving} className="rounded-2xl">
            {isSaving ? "Salvando…" : "Salvar / atualizar"}
          </Button>
          <Button variant="destructive" onClick={deleteBlock} disabled={isSaving} className="rounded-2xl">
            Excluir
          </Button>
        </div>
      </div>
    </div>
  );
}
