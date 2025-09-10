import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const rows = await prisma.object.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const data = await req.json();

  const payload = {
    catalog: String(data.catalog ?? "").trim(),
    code: String(data.code ?? "").trim(),
    name: String(data.name ?? "").trim(),
    type: String(data.type ?? "").trim(),
    raDeg: Number(data.raDeg),
    decDeg: Number(data.decDeg),
    magnitude:
      data.magnitude === "" || data.magnitude == null ? null : Number(data.magnitude),
    constellation: data.constellation ? String(data.constellation) : null,
  };

  if (
    !payload.catalog || !payload.code || !payload.name || !payload.type ||
    !Number.isFinite(payload.raDeg) || !Number.isFinite(payload.decDeg)
  ) {
    return new Response(JSON.stringify({ error: "Missing/invalid fields" }), { status: 400 });
  }

  try {
    const created = await prisma.object.create({ data: payload });
    return new Response(JSON.stringify(created), { status: 201 });
  } catch (e: any) {
    // există deja (unicitate catalog+code) -> returnează intrarea existentă (idempotent)
    if (e?.code === "P2002") {
      const existing = await prisma.object.findUnique({
        where: { catalog_code: { catalog: payload.catalog, code: payload.code } },
      });
      return new Response(JSON.stringify(existing), { status: 200 });
    }
    console.error("POST /api/objects", e);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
