"use client";

import { useEffect, useState } from "react";

type Obj = { id: string; name: string; catalog?: string | null; code?: string | null };
type Site = { id: string; name: string };
type Gear = { id: string; type: string; model: string };

type FormState = {
  objectId: string;
  siteId: string | null;
  gearId: string | null;
  date: string; 
  seeing: number | "";
  transparency: number | "";
  moonPhase: number | "";
  description: string;
};

export default function ObsForm({ onSaved }: { onSaved?: () => void }) {
  const [objects, setObjects] = useState<Obj[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [gear, setGear] = useState<Gear[]>([]);

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(() => ({
    objectId: "",
    siteId: null,
    gearId: null,
    date: new Date().toISOString().slice(0, 16),
    seeing: 3,
    transparency: 3,
    moonPhase: 50,
    description: "",
  }));

  useEffect(() => {
    (async () => {
      try {
        const [oRes, sRes, gRes] = await Promise.all([
          fetch("/api/objects"),
          fetch("/api/sites"),
          fetch("/api/gear"),
        ]);
        const [o, s, g] = await Promise.all([oRes.json(), sRes.json(), gRes.json()]);
        setObjects(Array.isArray(o) ? o : []);
        setSites(Array.isArray(s) ? s : []);
        setGear(Array.isArray(g) ? g : []);
        setForm((f) => ({
          ...f,
          objectId: (o?.[0]?.id as string) ?? "",
          siteId: (s?.[0]?.id as string) ?? null,
          gearId: (g?.[0]?.id as string) ?? null,
        }));
      } catch {
      }
    })();
  }, []);

  function update<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function save() {
    if (!form.objectId) return;

    setSaving(true);
    try {
      const payload: any = {
        objectId: form.objectId,
        siteId: form.siteId === "" ? null : form.siteId,
        gearId: form.gearId === "" ? null : form.gearId,
        date: new Date(form.date),
        description: form.description,
      };

      const toNum = (v: number | "") =>
        v === "" ? null : Number.isFinite(Number(v)) ? Number(v) : null;

      const seeing = toNum(form.seeing);
      if (seeing !== null) payload.seeing = seeing;

      const transparency = toNum(form.transparency);
      if (transparency !== null) payload.transparency = transparency;

      const moonPhase = toNum(form.moonPhase);
      if (moonPhase !== null) payload.moonPhase = moonPhase;

      const res = await fetch("/api/observations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || `Eroare ${res.status}`);
      }

      setForm((f) => ({ ...f, description: "", imageUrl: "" }));
      onSaved?.();
    } catch {
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {}
        <label className="block">
          <span className="block text-sm text-zinc-400 mb-1">Obiect</span>
          <select
            className="w-full rounded-xl bg-zinc-900/50 border border-zinc-700 p-2"
            value={form.objectId}
            onChange={(e) => update("objectId", e.target.value)}
          >
            {objects.map((o) => (
              <option key={o.id} value={o.id}>
                {o.catalog && o.code ? `${o.catalog} ${o.code} — ${o.name}` : o.name}
              </option>
            ))}
          </select>
        </label>

        {}
        <label className="block">
          <span className="block text-sm text-zinc-400 mb-1">Locație (opțional)</span>
          <select
            className="w-full rounded-xl bg-zinc-900/50 border border-zinc-700 p-2"
            value={form.siteId ?? ""}
            onChange={(e) => update("siteId", e.target.value || null)}
          >
            <option value="">— Niciuna —</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>

        {}
        <label className="block">
          <span className="block text-sm text-zinc-400 mb-1">Echipament (opțional)</span>
          <select
            className="w-full rounded-xl bg-zinc-900/50 border border-zinc-700 p-2"
            value={form.gearId ?? ""}
            onChange={(e) => update("gearId", e.target.value || null)}
          >
            <option value="">— Niciunul —</option>
            {gear.map((g) => (
              <option key={g.id} value={g.id}>
                {g.model} ({g.type})
              </option>
            ))}
          </select>
        </label>
      </div>

      {}
      <label className="block">
        <span className="block text-sm text-zinc-400 mb-1">Data & ora</span>
        <input
          type="datetime-local"
          className="w-full rounded-xl bg-zinc-900/50 border border-zinc-700 p-2"
          value={form.date}
          onChange={(e) => update("date", e.target.value)}
        />
      </label>

      {}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <label className="block">
          <span className="block text-sm text-zinc-400 mb-1">Seeing</span>
          <input
            type="number"
            min={1}
            max={5}
            className="w-full rounded-xl bg-zinc-900/50 border border-zinc-700 p-2"
            value={form.seeing}
            onChange={(e) => update("seeing", e.target.value === "" ? "" : Number(e.target.value))}
          />
        </label>

        <label className="block">
          <span className="block text-sm text-zinc-400 mb-1">Transparență</span>
          <input
            type="number"
            min={1}
            max={5}
            className="w-full rounded-xl bg-zinc-900/50 border border-zinc-700 p-2"
            value={form.transparency}
            onChange={(e) =>
              update("transparency", e.target.value === "" ? "" : Number(e.target.value))
            }
          />
        </label>

        <label className="block">
          <span className="block text-sm text-zinc-400 mb-1">Faza Lunii (%)</span>
          <input
            type="number"
            min={0}
            max={100}
            className="w-full rounded-xl bg-zinc-900/50 border border-zinc-700 p-2"
            value={form.moonPhase}
            onChange={(e) =>
              update("moonPhase", e.target.value === "" ? "" : Number(e.target.value))
            }
          />
        </label>
      </div>

      {/* Note & imagine */}
      <label className="block">
        <span className="block text-sm text-zinc-400 mb-1">Note</span>
        <textarea
          className="w-full rounded-xl bg-zinc-900/50 border border-zinc-700 p-2"
          rows={4}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
        />
      </label>

      

      <div className="flex gap-3">
        <button
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white disabled:opacity-50"
          onClick={save}
          disabled={saving || !form.objectId}
        >
          {saving ? "Se salvează..." : "Salvează observația"}
        </button>
      </div>
    </div>
  );
}
