"use client";
import { useEffect, useState } from "react";

type Obj = { id:string; name:string; catalog:string; code:string; raDeg:number; decDeg:number };
type Site = { id:string; name:string };
type Gear = { id:string; model:string };

export default function ObsForm({ onSaved }: { onSaved: ()=>void }) {
  const [objects, setObjects] = useState<Obj[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [gear, setGear] = useState<Gear[]>([]);
  const [form, setForm] = useState<any>({
    objectId: "", siteId: "", gearId: "", date: new Date().toISOString().slice(0,16),
    seeing: 3, transparency: 3, moonPhase: 50, description: "", imageUrl: ""
  });

  useEffect(()=>{
    Promise.all([
      fetch("/api/objects").then(r=>r.json()).catch(()=>[]),
      fetch("/api/sites").then(r=>r.json()).catch(()=>[]),
      fetch("/api/gear").then(r=>r.json()).catch(()=>[]),
    ]).then(([o,s,g])=>{
      setObjects(o); setSites(s); setGear(g);
      setForm((f:any)=>({ ...f, objectId: o[0]?.id ?? "", siteId: s[0]?.id ?? "", gearId: g[0]?.id ?? "" }));
    });
  },[]);

const [file, setFile] = useState<File | null>(null);

<label className="text-sm space-y-1">
  <span className="opacity-80">Imagine</span>
  <input type="file" accept="image/*" onChange={(e)=>setFile(e.target.files?.[0] ?? null)} />
</label>

const save = async ()=>{
  const payload: any = { ...form, date: new Date(form.date) };

  if (file) {
    const fd = new FormData(); fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const j = await res.json();
    if (res.ok && j.url) payload.imageUrl = j.url;
  }

  await fetch("/api/observations", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(payload) });
  setFile(null);
  onSaved();
};


  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 grid md:grid-cols-3 gap-3">
      <label className="text-sm space-y-1">
        <span className="opacity-80">Obiect</span>
        <select className="w-full rounded bg-black/30 px-3 py-2" value={form.objectId} onChange={(e)=>setForm({...form, objectId:e.target.value})}>
          {objects.map(o=><option key={o.id} value={o.id}>{o.catalog} {o.code} — {o.name}</option>)}
        </select>
      </label>

      <label className="text-sm space-y-1">
        <span className="opacity-80">Locație</span>
        <select className="w-full rounded bg-black/30 px-3 py-2" value={form.siteId} onChange={(e)=>setForm({...form, siteId:e.target.value})}>
          <option value="">(neprecizat)</option>
          {sites.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </label>

      <label className="text-sm space-y-1">
        <span className="opacity-80">Echipament</span>
        <select className="w-full rounded bg-black/30 px-3 py-2" value={form.gearId} onChange={(e)=>setForm({...form, gearId:e.target.value})}>
          <option value="">(neprecisat)</option>
          {gear.map(g=><option key={g.id} value={g.id}>{g.model}</option>)}
        </select>
      </label>

      <label className="text-sm space-y-1">
        <span className="opacity-80">Data & ora</span>
        <input type="datetime-local" className="w-full rounded bg-black/30 px-3 py-2" value={form.date} onChange={(e)=>setForm({...form, date:e.target.value})}/>
      </label>

      {[
        ["seeing","Seeing (1-5)"], ["transparency","Transparență (1-5)"], ["moonPhase","Faza Lunii (0-100)"]
      ].map(([k,label])=>(
        <label key={k} className="text-sm space-y-1">
          <span className="opacity-80">{label}</span>
          <input type="number" className="w-full rounded bg-black/30 px-3 py-2" value={form[k]} onChange={(e)=>setForm({...form, [k]: parseInt(e.target.value)})}/>
        </label>
      ))}

      <label className="md:col-span-3 text-sm space-y-1">
        <span className="opacity-80">Note</span>
        <textarea className="w-full rounded bg-black/30 px-3 py-2" rows={3} value={form.description} onChange={(e)=>setForm({...form, description:e.target.value})}/>
      </label>

      <div className="md:col-span-3 flex justify-end gap-2">
        <button onClick={save} className="px-4 py-2 rounded bg-teal-600 hover:bg-teal-500">Salvează observația</button>
      </div>
    </div>
  );
}
