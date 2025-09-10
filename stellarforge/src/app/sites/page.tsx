"use client";
import { useEffect, useState } from "react";

type Site = { id:string; name:string; lat:number; lon:number; bortle:number; notes?:string|null };

export default function SitesPage() {
  const [rows, setRows] = useState<Site[]>([]);
  const [form, setForm] = useState<any>({ name:"", lat:44.0, lon:26.0, bortle:4, notes:"" });

  const load = async ()=> setRows(await fetch("/api/sites").then(r=>r.json()));
  useEffect(()=>{ load(); }, []);

  const save = async ()=>{
    await fetch("/api/sites", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({...form, lat:parseFloat(form.lat), lon:parseFloat(form.lon), bortle:parseInt(form.bortle)})});
    setForm({ name:"", lat:44.0, lon:26.0, bortle:4, notes:"" }); load();
  };
  const del = async (id:string)=>{ await fetch(`/api/sites/${id}`, { method:"DELETE" }); load(); };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Locații (dark-sky)</h1>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 grid md:grid-cols-5 gap-2">
        {[
          ["name","Nume"], ["lat","Lat"], ["lon","Lon"], ["bortle","Bortle (1-9)"], ["notes","Note"],
        ].map(([k,label])=>(
          <label key={k} className="text-sm space-y-1">
            <span className="opacity-80">{label}</span>
            <input className="w-full rounded bg-black/30 px-3 py-2" value={form[k as keyof typeof form] ?? ""} onChange={(e)=>setForm({...form, [k]: e.target.value})}/>
          </label>
        ))}
        <div className="md:col-span-5 flex justify-end">
          <button onClick={save} className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500">Adaugă</button>
        </div>
      </div>

      <ul className="grid md:grid-cols-2 gap-4">
        {rows.map(s=>(
          <li key={s.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex justify-between gap-4">
              <div>
                <div className="text-xl font-medium">{s.name}</div>
                <div className="text-sm opacity-80">Lat {s.lat} • Lon {s.lon} • Bortle {s.bortle}</div>
                {s.notes && <div className="text-sm opacity-70 mt-1">{s.notes}</div>}
              </div>
              <button onClick={()=>del(s.id)} className="px-3 py-2 rounded bg-red-600 hover:bg-red-500 h-fit">Șterge</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
