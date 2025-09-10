"use client";
import React, { useEffect, useState } from "react";

type Gear = { id:string; type:string; model:string; specsJson?:string|null; notes?:string|null };

export default function Page() {
  const [rows, setRows] = useState<Gear[]>([]);
  const [form, setForm] = useState({ type:"telescope", model:"", specsJson:"", notes:"" });
  const [msg, setMsg] = useState<string | null>(null);

  const load = async ()=> setRows(await fetch("/api/gear").then(r=>r.json()));
  useEffect(()=>{ load(); }, []);

  const save = async ()=>{
    setMsg(null);
    const res = await fetch("/api/gear", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(form) });
    if(!res.ok){ setMsg("Nu s-a putut salva."); return; }
    setForm({ type:"telescope", model:"", specsJson:"", notes:"" }); load();
  };

  const del = async (id:string)=>{
    setMsg(null);
    const res = await fetch(`/api/gear/${id}`, { method:"DELETE" });
    if(!res.ok){ setMsg("Nu s-a putut șterge."); return; }
    load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Echipament</h1>
      {msg && <div className="rounded-xl border border-red-500/30 bg-red-500/15 px-3 py-2 text-sm">{msg}</div>}

      <div className="rounded-3xl border border-white/10 bg-white/5 p-4 grid md:grid-cols-4 gap-2">
        {[
          ["type","Tip (telescope/camera/binocular)"],
          ["model","Model"],
          ["specsJson","Specs (JSON)"],
          ["notes","Note"],
        ].map(([k,label])=>(
          <label key={k} className="text-sm space-y-1">
            <span className="opacity-80">{label}</span>
            <input
              className="w-full rounded-xl bg-black/30 px-3 py-2"
              value={(form as any)[k]}
              onChange={(e)=>setForm({ ...form, [k]: e.target.value })}
            />
          </label>
        ))}
        <div className="md:col-span-4 flex justify-end">
          <button onClick={save} className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500">Adaugă</button>
        </div>
      </div>

      <ul className="grid md:grid-cols-2 gap-4">
        {rows.map(g=>(
          <li key={g.id} className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-transparent p-4">
            <div className="flex justify-between gap-4">
              <div>
                <div className="text-xl font-semibold">{g.model}</div>
                <div className="text-sm opacity-80">{g.type}</div>
                {g.specsJson && <pre className="text-xs opacity-70 mt-1 whitespace-pre-wrap">{g.specsJson}</pre>}
                {g.notes && <div className="text-sm opacity-70 mt-1">{g.notes}</div>}
              </div>
              <button onClick={()=>del(g.id)} className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500 h-fit">Șterge</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
