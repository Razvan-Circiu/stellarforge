export default function Page() {
  const Card = ({ href, title, desc }: { href:string; title:string; desc:string }) => (
    <a href={href} className="group rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-5 hover:bg-white/10 transition">
      <div className="text-xl font-semibold">{title}</div>
      <div className="opacity-80">{desc}</div>
      <div className="mt-3 text-sm opacity-70 group-hover:opacity-100">Deschide →</div>
    </a>
  );
  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-gradient-to-b from-white/10 to-transparent p-8">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight">StellarForge</h1>
        <p className="mt-3 max-w-2xl opacity-85">
          Catalog de obiecte + locații + echipament + jurnal de observații cu un fundal planetar.
        </p>
      </section>
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card href="/objects" title="Catalog Obiecte" desc="Messier, NGC, RA/Dec, mag, constelații" />
        <Card href="/sites" title="Locații" desc="Bortle, coordonate, notițe" />
        <Card href="/gear" title="Echipament" desc="Telescoape, camere, binocluri" />
        <Card href="/observations" title="Observații & Planner" desc="Jurnal + planner circular (real)" />
      </section>
    </div>
  );
}
