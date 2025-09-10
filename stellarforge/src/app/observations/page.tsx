"use client";
import ObsForm from "@/components/ObsForm";
import Planner from "@/components/Planner";
import { useEffect, useState } from "react";


type Obs = {
  id:string; date:string; description?:string|null; seeing?:number|null; transparency?:number|null; moonPhase?:number|null;
  object?: { catalog:string; code:string; name:string };
  site?: { name:string };
  gear?: { model:string };
};

export default function ObservationsPage() {
  const [rows, setRows] = useState<Obs[]>([]);
  const load = async ()=> setRows(await fetch("/api/observations").then(r=>r.json()));
  useEffect(()=>{ load(); }, []);
  const del = async (id:string)=>{ await fetch(`/api/observations/${id}`, { method:"DELETE" }); load(); };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Observații</h1>

      <ObsForm onSaved={load} />

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          {rows.map(o=>(
            <div key={o.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex justify-between">
                <div>
                  <div className="text-sm opacity-70">{new Date(o.date).toLocaleString()}</div>
                  <div className="text-lg font-medium">{o.object ? `${o.object.catalog} ${o.object.code} — ${o.object.name}` : "Obiect"}</div>
                  <div className="text-sm opacity-80">
                    {o.site ? `Site: ${o.site.name} • ` : ""}{o.gear ? `Gear: ${o.gear.model}` : ""}
                  </div>
                  <div className="text-sm opacity-80">
                    {o.seeing ? `Seeing ${o.seeing}/5` : ""}{o.transparency ? ` • Transp. ${o.transparency}/5` : ""}{o.moonPhase!=null ? ` • Lună ${o.moonPhase}%` : ""}
                  </div>
                  {o.description && <p className="text-sm opacity-90 mt-2">{o.description}</p>}
                </div>
                <button onClick={()=>del(o.id)} className="px-3 py-2 h-fit rounded bg-red-600 hover:bg-red-500">Șterge</button>
              </div>
            </div>
          ))}
        </div>

        <div>
          <h2 className="text-xl font-medium mb-2">Planner</h2>
          <Planner />
        </div>
      </div>
    </div>
  );
}
