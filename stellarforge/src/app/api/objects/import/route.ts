import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const fd = await req.formData();
  const file = fd.get("file") as File | null;
  if (!file) return new Response(JSON.stringify({ error: "No file" }), { status: 400 });
  const text = await file.text();
  const lines = text.split(/\r?\n/).filter(Boolean);
  const rows = lines.slice(1); // skip header
  for (const line of rows) {
    const parts = line.match(/(".*?"|[^,]+)(?=,|$)/g)?.map(s=> s.replace(/^"|"$/g,'').replace(/""/g,'"')) ?? [];
    if (parts.length < 6) continue;
    const [catalog, code, name, type, raDeg, decDeg, magnitude, constellation] = parts;
    await prisma.object.upsert({
      where: { catalog_code: { catalog, code } },
      update: { name, type, raDeg: +raDeg, decDeg: +decDeg, magnitude: magnitude ? +magnitude : null, constellation: constellation || null },
      create: { catalog, code, name, type, raDeg: +raDeg, decDeg: +decDeg, magnitude: magnitude ? +magnitude : null, constellation: constellation || null },
    });
  }
  return Response.json({ ok: true });
}
