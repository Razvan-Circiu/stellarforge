"use client";
import { useEffect, useState } from "react";

export default function NightToggle() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    document.body.classList.toggle("night-red", on);
  }, [on]);
  return (
    <button
      onClick={() => setOn(v=>!v)}
      className="px-3 py-1 rounded-lg bg-red-700/60 hover:bg-red-600/60 text-sm"
      title="Comută modul 'Night Red'"
    >
      {on ? "Night Red: ON" : "Night Red: OFF"}
    </button>
  );
}
