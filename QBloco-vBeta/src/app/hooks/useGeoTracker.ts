import { useCallback, useMemo, useRef, useState } from "react";
import type { TrackPoint } from "../lib/distance";
import { pathDistanceMeters, haversineMeters } from "../lib/distance";

type TrackState = "idle" | "tracking" | "error";

type GeoMeta = {
  lastTimestamp?: number;
  lastAccepted?: TrackPoint | null;
};

export function useGeoTracker() {
  const [state, setState] = useState<TrackState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [points, setPoints] = useState<TrackPoint[]>([]);
  const watchIdRef = useRef<number | null>(null);
  const metaRef = useRef<GeoMeta>({ lastTimestamp: undefined, lastAccepted: null });

  const canUseGeolocation = typeof navigator !== "undefined" && !!navigator.geolocation;

  const stop = useCallback(() => {
    if (watchIdRef.current !== null && canUseGeolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    watchIdRef.current = null;
    metaRef.current = { lastTimestamp: undefined, lastAccepted: null };
    setState("idle");
  }, [canUseGeolocation]);

  const start = useCallback(async () => {
    if (!canUseGeolocation) {
      setState("error");
      setError("Geolocalização indisponível neste dispositivo/navegador.");
      return;
    }

    // Best-effort permission check for clearer UX
    try {
      // @ts-expect-error - Permissions API typing differs across TS lib versions
      const perm = await navigator.permissions?.query?.({ name: "geolocation" });
      if (perm?.state === "denied") {
        setState("error");
        setError("Permissão de localização negada. Ative a localização no navegador para usar o check-in.");
        return;
      }
    } catch {
      // ignore (not supported)
    }

    setError(null);
    setPoints([]);
    metaRef.current = { lastTimestamp: undefined, lastAccepted: null };
    setState("tracking");

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const t = pos.timestamp || Date.now();
        const next: TrackPoint = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          t,
          acc: pos.coords.accuracy,
        };

        setPoints((prev) => {
          const last = prev[prev.length - 1];
          // Basic accuracy filter: ignore very imprecise samples (common in crowds/urban canyons)
          if (typeof next.acc === "number" && next.acc > 60) return prev;

          // De-dup exact
          if (last && Math.abs(last.lat - next.lat) < 1e-7 && Math.abs(last.lng - next.lng) < 1e-7) return prev;

          // Reject implausible jumps based on time delta and speed
          const lastAccepted = metaRef.current.lastAccepted ?? (last ?? null);
          if (lastAccepted) {
            const dt = Math.max(1, (next.t || Date.now()) - (lastAccepted.t || Date.now())) / 1000; // seconds
            const d = haversineMeters(lastAccepted, next);
            const speed = d / dt; // m/s

            // Carnival walking/running: allow up to ~6 m/s (~21.6 km/h). Beyond that is almost always GPS jump.
            if (speed > 6) return prev;

            // Also ignore tiny jitter: require at least ~6m displacement
            if (d < 6) return prev;
          }

          metaRef.current.lastAccepted = next;
          metaRef.current.lastTimestamp = next.t;

          return [...prev, next];
        });
      },
      (err) => {
        setState("error");
        if (err.code === 1) {
          setError("Permissão de localização negada. Ative a localização para usar o check-in.");
        } else if (err.code === 2) {
          setError("Não foi possível determinar sua localização (sinal fraco). Tente novamente.");
        } else if (err.code === 3) {
          setError("A localização demorou a responder. Tente novamente.");
        } else {
          setError(err.message || "Falha ao obter localização.");
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 3000,
        timeout: 15000,
      }
    );

    watchIdRef.current = id;
  }, [canUseGeolocation]);

  const distanceMeters = useMemo(() => pathDistanceMeters(points), [points]);

  const reset = useCallback(() => {
    setPoints([]);
    metaRef.current = { lastTimestamp: undefined, lastAccepted: null };
    setState("idle");
    setError(null);
  }, []);

  return {
    canUseGeolocation,
    state,
    error,
    points,
    distanceMeters,
    start,
    stop,
    reset,
  };
}
