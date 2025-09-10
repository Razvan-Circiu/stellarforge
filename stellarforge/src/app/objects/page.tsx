"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useToast } from "../../components/Toast";

type Obj = {
  id: string; catalog: string; code: string; name: string; type: string;
  raDeg: number; decDeg: number; magnitude?: number|null; constellation?: string|null;
};

export default function ObjectsPage() {
  const { push } = useToast();
  const [rows, setRows] = useState<Obj[]>([]);
  const [q, setQ] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<any>({
    catalog: "Messier", code: "", name: "", type: "nebula",
    raDeg: "", decDeg: "", magnitude: "", constellation: ""
  });

  const load = async () => setRows(await fetch("/api/objects").then((r: Response)=>r.json()));
  useEffect(()=>{ load(); }, []);

  const list = useMemo(()=>{
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((o: Obj)=>{
      return [o.catalog, o.code, o.name, o.constellation ?? "", o.type]
        .some(v => v.toLowerCase().includes(s));
    });
  }, [rows, q]);

  const save = async () => {
    const payload = {
      ...form,
      raDeg: form.raDeg === "" ? 0 : parseFloat(form.raDeg),
      decDeg: form.decDeg === "" ? 0 : parseFloat(form.decDeg),
      magnitude: form.magnitude === "" ? null : parseFloat(form.magnitude),
      constellation: form.constellation || null
    };
    const res = await fetch("/api/objects", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(payload) });
    if(!res.ok){ push({ text:"Nu s-a putut salva obiectul", tone:"err" }); return; }
    setForm({ catalog:"Messier", code:"", name:"", type:"nebula", raDeg:"", decDeg:"", magnitude:"", constellation:"" });
    push({ text:"Obiect adăugat" }); load();
  };

  const del = async (id:string) => {
    if(!confirm("Ștergi acest obiect?")) return;
    const res = await fetch(`/api/objects/${id}`, { method:"DELETE" });
    if(!res.ok){
      const j = await res.json().catch(()=>({}));
      push({ text: j?.error || "Nu s-a putut șterge", tone:"err" }); return;
    }
    push({ text:"Șters" }); load();
  };

  const exportCsv = ()=> { window.location.href = "/api/objects/export"; };
  const importCsv = async (file: File)=>{
    const fd = new FormData(); fd.append("file", file);
    const res = await fetch("/api/objects/import", { method:"POST", body: fd });
    if(!res.ok){ push({ text:"Import eșuat", tone:"err" }); return; }
    push({ text:"Import OK" }); load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 items-end justify-between">
        <h1 className="text-2xl font-semibold">Catalog Obiecte</h1>
        <div className="flex gap-2">
          <input placeholder="Caută (M31, Andromeda, galaxy...)"
                 className="rounded-xl bg-black/30 px-3 py-2"
                 value={q} onChange={(e)=>setQ(e.target.value)} />
          <button onClick={exportCsv} className="px-3 py-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-sm">Export CSV</button>
          <button onClick={()=>fileRef.current?.click()} className="px-3 py-2 rounded-xl bg-indigo-600/90 hover:bg-indigo-500 text-sm">Import CSV</button>
          <input ref={fileRef} type="file" accept=".csv" className="hidden"
                 onChange={e=> e.target.files && importCsv(e.target.files[0])}/>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-4 grid md:grid-cols-4 gap-2">
        {[
          ["catalog","Catalog"], ["code","Cod"], ["name","Nume"], ["type","Tip (nebula/galaxy/cluster)"],
          ["raDeg","RA°"], ["decDeg","Dec°"], ["magnitude","Mag"], ["constellation","Constelație"],
        ].map(([k,label])=>(
          <label key={k} className="text-sm space-y-1">
            <span className="opacity-80">{label}</span>
            <input className="w-full rounded-lg bg-black/30 px-3 py-2"
                   value={form[k as keyof typeof form] ?? ""}
                   onChange={(e)=>setForm({...form, [k]: e.target.value})}/>
          </label>
        ))}
        <div className="md:col-span-4 flex justify-end">
          <button onClick={save} className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500">Adaugă</button>
        </div>
      </div>

      <ul className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {list.map((o: Obj)=>(
          <li key={o.id} className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-transparent p-4">
            <div className="flex justify-between gap-4">
              <div>
                <div className="text-sm opacity-70">{o.catalog} • {o.code}</div>
                <div className="text-xl font-semibold">{o.name}</div>
                <div className="text-sm opacity-85">{o.type} • RA {o.raDeg}° • Dec {o.decDeg}° {o.magnitude != null ? `• mag ${o.magnitude}` : ""}</div>
                {o.constellation && <div className="text-sm opacity-70 mt-1">{o.constellation}</div>}
              </div>
              <button onClick={()=>del(o.id)} className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500 h-fit" title="Șterge">Șterge</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
