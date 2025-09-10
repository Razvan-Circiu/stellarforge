"use client";
import { useEffect, useMemo, useRef, useState } from "react";

type Obj = { id:string; name:string; catalog:string; code:string; raDeg:number; decDeg:number };
type Site = { id:string; name:string; lat:number; lon:number };

const deg2rad = (d:number)=> d*Math.PI/180;
const rad2deg = (r:number)=> r*180/Math.PI;

function julianDay(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}
function gmst(date: Date): number {
  const JD = julianDay(date);
  const D = JD - 2451545.0;
  let g = 18.697374558 + 24.06570982441908 * D;
  g = ((g % 24) + 24) % 24;
  return g;
}
function lst(date: Date, lonDeg: number): number {
  let l = gmst(date) + lonDeg/15;
  l = ((l % 24)+24)%24;
  return l;
}
function altitudeDeg(raDeg: number, decDeg: number, latDeg: number, lstHours: number): number {
  const HAdeg = (lstHours*15) - raDeg;
  const ha = deg2rad(HAdeg);
  const dec = deg2rad(decDeg);
  const lat = deg2rad(latDeg);
  const sinAlt = Math.sin(dec)*Math.sin(lat) + Math.cos(dec)*Math.cos(lat)*Math.cos(ha);
  return rad2deg(Math.asin(Math.min(1, Math.max(-1, sinAlt))));
}

function sunRaDec(date: Date) {
  const d = (julianDay(date) - 2451545.0) / 36525;
  const M = (357.52911 + d*(35999.05029 - 0.0001537*d)) % 360;
  const L0 = (280.46646 + d*(36000.76983 + 0.0003032*d)) % 360;
  const C = (1.914602 - d*(0.004817 + 0.000014*d)) * Math.sin(deg2rad(M))
          + (0.019993 - 0.000101*d) * Math.sin(deg2rad(2*M))
          + 0.000289 * Math.sin(deg2rad(3*M));
  const lam = L0 + C;
  const eps = 23.439291 - 0.0130042 * d;
  const ra = Math.atan2(Math.cos(deg2rad(eps))*Math.sin(deg2rad(lam)), Math.cos(deg2rad(lam)));
  const dec = Math.asin(Math.sin(deg2rad(eps))*Math.sin(deg2rad(lam)));
  return { raDeg: (rad2deg(ra)+360)%360, decDeg: rad2deg(dec) };
}

function moonRaDec(date: Date) {
  const d = julianDay(date) - 2451545.0;
  const L = deg2rad((218.316 + 13.176396*d) % 360);
  const M = deg2rad((134.963 + 13.064993*d) % 360);
  const F = deg2rad((93.272 + 13.229350*d) % 360);
  const lon = L + deg2rad(6.289) * Math.sin(M);
  const lat = deg2rad(5.128) * Math.sin(F);
  const eps = deg2rad(23.439 - 0.0000004*d);
  const x = Math.cos(lon)*Math.cos(lat);
  const y = Math.sin(lon)*Math.cos(lat)*Math.cos(eps) - Math.sin(lat)*Math.sin(eps);
  const z = Math.sin(lon)*Math.cos(lat)*Math.sin(eps) + Math.sin(lat)*Math.cos(eps);
  const ra = Math.atan2(y, x);
  const dec = Math.asin(z);
  return { raDeg: (rad2deg(ra)+360)%360, decDeg: rad2deg(dec) };
}

function sepDeg(ra1:number, dec1:number, ra2:number, dec2:number){
  const a1=deg2rad(ra1), d1=deg2rad(dec1), a2=deg2rad(ra2), d2=deg2rad(dec2);
  const c = Math.sin(d1)*Math.sin(d2)+Math.cos(d1)*Math.cos(d2)*Math.cos(a1-a2);
  return rad2deg(Math.acos(Math.min(1, Math.max(-1, c))));
}

function drawCircular(
  c: HTMLCanvasElement,
  series: { label:string; samples: { angle:number; alt:number }[] }[],
) {
  const ctx = c.getContext("2d")!;
  const w = c.width, h = c.height, cx = w/2, cy = h/2;
  const R = Math.min(w,h)/2 - 10;
  ctx.clearRect(0,0,w,h);

  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 1;
  for (let alt = 0; alt <= 90; alt += 30) {
    const r = R * (1 - alt/90);
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.stroke();
  }
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI*2); ctx.stroke();

  for (let i=0;i<48;i++){
    const a = (-Math.PI/2) + (i/48)*Math.PI*2;
    const longTick = i%2===0;
    const r1 = R*(longTick?0.96:0.98), r2 = R;
    ctx.beginPath(); ctx.moveTo(cx+Math.cos(a)*r1, cy+Math.sin(a)*r1);
    ctx.lineTo(cx+Math.cos(a)*r2, cy+Math.sin(a)*r2); ctx.stroke();
  }
  for (let h=0; h<24; h+=3){
    const a = (-Math.PI/2) + (h/24)*Math.PI*2;
    ctx.fillStyle="rgba(255,255,255,0.8)";
    ctx.font="11px system-ui"; ctx.textAlign="center"; ctx.textBaseline="top";
    const tx = cx+Math.cos(a)*(R+8), ty = cy+Math.sin(a)*(R+8);
    ctx.fillText(String(h).padStart(2,"0"), tx-6, ty);
  }
  ctx.restore();

  series.forEach((s, idx)=>{
    const hue = (idx*60)%360;
    ctx.strokeStyle = `hsla(${hue},82%,70%,1)`;
    ctx.lineWidth = 3;

    let path: {x:number;y:number}[] = [];
    const flush = ()=>{
      if (path.length < 2) { path = []; return; }
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let i=1;i<path.length;i++) ctx.lineTo(path[i].x, path[i].y);
      ctx.stroke();
      path = [];
    };

    s.samples.forEach(({ angle, alt })=>{
      const a = (-Math.PI/2) + angle;
      const r = R * (1 - Math.max(0, Math.min(alt, 90))/90);
      const x = cx + Math.cos(a)*r, y = cy + Math.sin(a)*r;
      if (alt > 0) path.push({x,y}); else flush();
    });
    flush();

    ctx.fillStyle="rgba(255,255,255,0.95)"; ctx.font="12px system-ui"; ctx.textAlign="center";
    ctx.fillText(s.label, cx, cy + R*0.65 + idx*14);
  });

  ctx.fillStyle="rgba(255,255,255,0.9)";
  ctx.font="13px system-ui"; ctx.textAlign="center";
  ctx.fillText("Planner circular • altitudine (0° margine → 90° centru)", cx, cy - R - 14);
}

export default function Planner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [objects, setObjects] = useState<Obj[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [sel, setSel] = useState<{ objectId?:string; siteId?:string; lat:number; lon:number }>({ lat: 44.43, lon: 26.10 });
  const [dateStr, setDateStr] = useState<string>(()=> new Date().toISOString().slice(0,16)); // local time minute precision

  useEffect(()=>{
    Promise.all([
      fetch("/api/objects").then((r: Response)=>r.json()).catch(()=>[]),
      fetch("/api/sites").then((r: Response)=>r.json()).catch(()=>[]),
    ]).then(([o,s])=>{
      setObjects(o); setSites(s);
      setSel(prev => ({ ...prev, objectId: o[0]?.id, siteId: s[0]?.id ?? undefined, lat: s[0]?.lat ?? prev.lat, lon: s[0]?.lon ?? prev.lon }));
    });
  },[]);

  const useMyLocation = ()=>{
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(pos=>{
      setSel(prev => ({ ...prev, lat: pos.coords.latitude, lon: pos.coords.longitude, siteId: undefined }));
    });
  };

  const series = useMemo(()=>{
    if (!sel.objectId) return [];
    const obj = objects.find(o=>o.id===sel.objectId); if (!obj) return [];
    const startLocal = new Date(dateStr);

    const samples: { angle:number; alt:number }[] = [];
    for (let k=0; k<48; k++){
      const d = new Date(startLocal.getTime() + k*30*60*1000);
      const LST = lst(d, sel.lon);
      const altObj = altitudeDeg(obj.raDeg, obj.decDeg, sel.lat, LST);

      const sun = sunRaDec(d);
      const sunAlt = altitudeDeg(sun.raDeg, sun.decDeg, sel.lat, LST);

      const moon = moonRaDec(d);
      const moonSep = sepDeg(obj.raDeg, obj.decDeg, moon.raDeg, moon.decDeg);

      const visible = altObj > 0 && sunAlt < -18 && moonSep > 30;
      const angle = (k/48)*Math.PI*2;
      samples.push({ angle, alt: visible ? altObj : -90 });
    }
    return [{ label: `${obj.catalog} ${obj.code} • ${obj.name}`, samples }];
  }, [objects, sel, dateStr]);

  useEffect(()=>{
    const c = canvasRef.current; if (!c) return;
    const resize = ()=>{
      const dpr = window.devicePixelRatio || 1;
      const size = Math.min(520, window.innerWidth - 48);
      c.width = size*dpr; c.height = size*dpr; c.style.width = `${size}px`; c.style.height = `${size}px`;
      c.getContext("2d")!.setTransform(dpr,0,0,dpr,0,0);
      drawCircular(c, series);
    };
    resize(); window.addEventListener("resize", resize);
    return ()=> window.removeEventListener("resize", resize);
  },[series]);

  return (
    <div className="space-y-3">
      <div className="grid md:grid-cols-4 gap-2">
        <label className="text-sm space-y-1">
          <span className="opacity-80">Obiect</span>
          <select className="w-full rounded bg-black/30 px-3 py-2"
                  value={sel.objectId ?? ""}
                  onChange={(e)=>setSel(s=>({ ...s, objectId: e.target.value }))}>
            {objects.map((o: Obj)=><option key={o.id} value={o.id}>{o.catalog} {o.code} — {o.name}</option>)}
          </select>
        </label>
        <label className="text-sm space-y-1">
          <span className="opacity-80">Site</span>
          <select className="w-full rounded bg-black/30 px-3 py-2"
                  value={sel.siteId ?? ""}
                  onChange={(e)=>{
                    const id = e.target.value || undefined;
                    const site = sites.find(s=>s.id===id);
                    setSel(s=>({ ...s, siteId: id, lat: site?.lat ?? s.lat, lon: site?.lon ?? s.lon }));
                  }}>
            <option value="">(custom / GPS)</option>
            {sites.map((s: Site)=><option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
        <label className="text-sm space-y-1">
          <span className="opacity-80">Lat, Lon</span>
          <div className="flex gap-2">
            <input className="w-full rounded bg-black/30 px-3 py-2" placeholder="Lat" value={sel.lat}
                   onChange={(e)=>setSel(s=>({ ...s, lat: parseFloat(e.target.value) }))}/>
            <input className="w-full rounded bg-black/30 px-3 py-2" placeholder="Lon" value={sel.lon}
                   onChange={(e)=>setSel(s=>({ ...s, lon: parseFloat(e.target.value) }))}/>
          </div>
        </label>
        <label className="text-sm space-y-1">
          <span className="opacity-80">Start (ora locală)</span>
          <input type="datetime-local" className="w-full rounded bg-black/30 px-3 py-2"
                 value={dateStr} onChange={(e)=>setDateStr(e.target.value)} />
        </label>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={useMyLocation} className="px-3 py-2 rounded bg-teal-600 hover:bg-teal-500 text-sm">Folosește locația mea</button>
        <span className="text-xs opacity-70">
          Se afișează doar intervalele când <b>obiectul e deasupra orizontului</b>, e <b>noapte astronomică</b> (Soare &lt; −18°) și <b>Luna</b> e la &gt; 30°.
        </span>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
