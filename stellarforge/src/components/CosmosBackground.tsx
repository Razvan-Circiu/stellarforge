"use client";
import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";

function spherePoints(n = 5000, R = 2.1, jitter = 0.35) {
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const u = Math.random(), v = Math.random();
    const th = 2 * Math.PI * u, ph = Math.acos(2 * v - 1);
    const r = R * (1 - jitter * 0.5 + Math.random() * jitter);
    a[i*3+0] = r * Math.sin(ph) * Math.cos(th);
    a[i*3+1] = r * Math.sin(ph) * Math.sin(th);
    a[i*3+2] = r * Math.cos(ph);
  }
  return a;
}

function torusPoints(n = 7000, R = 2.35, r = 0.55) {
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const u = Math.random() * Math.PI * 2;      
    const v = (Math.random() * Math.PI * 2);    
    const rr = r * (0.85 + Math.random() * 0.3);
    const x = (R + rr * Math.cos(v)) * Math.cos(u);
    const y = (R + rr * Math.cos(v)) * Math.sin(u);
    const z = rr * Math.sin(v);
    a[i*3+0] = x; a[i*3+1] = y; a[i*3+2] = z;
  }
  return a;
}

function RoundPointsMaterial({ color = [1, 0.96, 0.9], size = 6, opacity = 0.95 }:{
  color?: [number,number,number]; size?: number; opacity?: number;
}) {
  const frag = `
    uniform vec3 uColor; uniform float uOpacity;
    void main(){
      vec2 uv = gl_PointCoord - 0.5;
      float d = length(uv) * 2.0;
      float a = smoothstep(1.0, 0.65, 1.0 - d);
      gl_FragColor = vec4(uColor, a * uOpacity);
    }`;
  const vert = `
    uniform float uSize;
    void main(){
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      gl_PointSize = uSize * (300.0 / -gl_Position.z);
    }`;
  return <shaderMaterial transparent depthWrite={false} fragmentShader={frag} vertexShader={vert}
           uniforms={{ uColor:{value:color}, uSize:{value:size}, uOpacity:{value:opacity} }} />;
}

function PointsLayer({ positions, color, size, opacity, rotSpeed, rot = [0,0,0] }:{
  positions: Float32Array; color: [number,number,number]; size:number; opacity:number;
  rotSpeed?: [number,number,number]; rot?: [number,number,number];
}) {
  const ref = useRef<any>(null);
  useFrame((_s, d)=>{
    if (!ref.current || !rotSpeed) return;
    ref.current.rotation.x += d * rotSpeed[0];
    ref.current.rotation.y += d * rotSpeed[1];
    ref.current.rotation.z += d * rotSpeed[2];
  });
  return (
    <group rotation={rot as any}>
      <points ref={ref}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <RoundPointsMaterial color={color} size={size} opacity={opacity}/>
      </points>
    </group>
  );
}

function Planet({
  radius = 0.35, pos = [ -0.85, -0.18, -1.25 ],
  base = [0.92,0.84,0.78], tint = [0.80,0.62,0.55],
  rotSpeed = 0.06, ring = false,
}:{
  radius?: number; pos?: [number,number,number];
  base?:[number,number,number]; tint?:[number,number,number];
  rotSpeed?: number; ring?: boolean;
}) {
  const meshRef = useRef<any>(null); const matRef = useRef<any>(null); const atmRef = useRef<any>(null);
  const frag = `
    uniform vec3 uBase; uniform vec3 uTint; uniform float uTime;
    varying vec3 vNormal; varying vec2 vUv;
    float band(float x){ return 0.5 + 0.5*sin(x); }
    float fbm(vec2 p){ float v=0.0, a=0.5; for(int i=0;i<5;i++){ v+=a*band(p.x)*band(p.y); p*=1.8; a*=0.55; p+=vec2(0.13,0.17);} return v; }
    void main(){
      float stripes = band(vUv.y*20.0 + uTime*0.08)*0.7 + fbm(vUv*4.0+uTime*0.02)*0.3;
      vec3 col = mix(uBase, uTint, stripes);
      float nd = pow(clamp(dot(normalize(vNormal), vec3(0.0,0.0,1.0)), 0.0, 1.0), 0.8);
      col *= (0.75 + 0.35*nd);
      gl_FragColor = vec4(col,1.0);
    }`;
  const vert = `varying vec3 vNormal; varying vec2 vUv;
    void main(){ vNormal=normalize(normalMatrix*normal); vUv=uv;
      gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} `;
  const atmFrag = `uniform vec3 uColor; varying vec3 vNormal;
    void main(){ float fres=pow(1.0-dot(normalize(vNormal), vec3(0,0,1)),2.0);
      gl_FragColor=vec4(uColor, fres*0.6);} `;
  const atmVert = `varying vec3 vNormal;
    void main(){ vNormal=normalize(normalMatrix*normal);
      gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} `;
  useFrame((_s,d)=>{ if(meshRef.current) meshRef.current.rotation.y += d*rotSpeed;
    if(matRef.current) matRef.current.uniforms.uTime.value += d;
    if(atmRef.current) atmRef.current.rotation.y += d*rotSpeed*0.4; });
  return (
    <group position={pos as any}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[radius, 48, 48]} />
        {}
        <shaderMaterial ref={matRef} fragmentShader={frag} vertexShader={vert}
          uniforms={{ uBase:{value:base}, uTint:{value:tint}, uTime:{value:0} }} />
      </mesh>
      <mesh ref={atmRef} scale={[1.045,1.045,1.045]}>
        <sphereGeometry args={[radius, 40, 40]} />
        {}
        <shaderMaterial fragmentShader={atmFrag} vertexShader={atmVert}
          transparent blending={2} depthWrite={false} side={1}
          uniforms={{ uColor:{ value:[0.6,0.8,1.0] } }} />
      </mesh>
      {ring && (
        <mesh rotation={[Math.PI/2.8, 0, 0]}>
          <ringGeometry args={[radius*1.25, radius*2.1, 64]} />
          <meshBasicMaterial color="#c8b8ff" transparent opacity={0.15} side={2} />
        </mesh>
      )}
    </group>
  );
}

export default function CosmosBackground() {
  const isMobile = typeof window !== "undefined" && window.matchMedia?.("(max-width: 640px)")?.matches;

  const starsA = useMemo(()=> spherePoints(isMobile? 2200 : 3800, 1.95, 0.32), [isMobile]);
  const starsB = useMemo(()=> spherePoints(isMobile? 2400 : 4600, 2.20, 0.45), [isMobile]);

  const mw1 = useMemo(()=> torusPoints(isMobile? 2500 : 5200, 2.35, 0.52), [isMobile]);
  const mw2 = useMemo(()=> torusPoints(isMobile? 1600 : 3400, 2.38, 0.40), [isMobile]);
  const mw3 = useMemo(()=> torusPoints(isMobile? 1000 : 2200, 2.30, 0.65), [isMobile]);

  const bandRotation: [number,number,number] = [-0.55, 0.85, 0.12];

  return (
    <div style={{ position:"fixed", inset:0, zIndex:-1, pointerEvents:"none" }}>
      <Canvas gl={{ antialias:true, alpha:true }} dpr={[1,2]} camera={{ fov:70, position:[0,0,1.6] }}>
        <ambientLight intensity={0.10} />

        {}
        <PointsLayer positions={starsA} color={[1.00,0.94,0.88]} size={6} opacity={0.96} rotSpeed={[0.0,0.010,0.003]} />
        <PointsLayer positions={starsB} color={[1.00,0.97,0.92]} size={6} opacity={0.90} rotSpeed={[0.0,0.018,0.006]} />

        {}
        <PointsLayer positions={mw1} color={[0.92,0.86,1.00]} size={8} opacity={0.12} rot={bandRotation} rotSpeed={[0, -0.004, 0]} />
        <PointsLayer positions={mw2} color={[0.80,0.90,1.00]} size={10} opacity={0.10} rot={bandRotation} rotSpeed={[0, -0.006, 0]} />
        <PointsLayer positions={mw3} color={[1.00,0.96,0.90]} size={7} opacity={0.08} rot={bandRotation} rotSpeed={[0, -0.005, 0]} />

        {/* planete */}
        <Planet radius={0.36} pos={[-0.85, -0.18, -1.25]} base={[0.92,0.84,0.78]} tint={[0.80,0.62,0.55]} rotSpeed={0.05} ring />
        <Planet radius={0.28} pos={[ 0.95,  0.25, -1.05]} base={[0.85,0.88,0.95]} tint={[0.62,0.70,0.95]} rotSpeed={0.08} />
      </Canvas>
    </div>
  );
}
