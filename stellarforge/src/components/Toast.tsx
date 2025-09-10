"use client";
import { createContext, useContext, useState, useCallback } from "react";

type Toast = { id: number; text: string; tone?: "ok" | "err" };
const Ctx = createContext<{ push:(t:Omit<Toast,"id">)=>void }>({ push:()=>{} });

export function ToastProvider({ children }:{ children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const push = useCallback((t: Omit<Toast,"id">)=> {
    const id = Date.now()+Math.random();
    setItems(s=>[...s, { id, ...t }]);
    setTimeout(()=> setItems(s=>s.filter(x=>x.id!==id)), 3000);
  },[]);
  return (
    <Ctx.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {items.map(i=>(
          <div key={i.id}
               className={`px-3 py-2 rounded-xl text-sm backdrop-blur border ${i.tone==="err" ? "bg-red-500/20 border-red-400/40" : "bg-emerald-500/20 border-emerald-400/40"}`}>
            {i.text}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
export const useToast = ()=> useContext(Ctx);
