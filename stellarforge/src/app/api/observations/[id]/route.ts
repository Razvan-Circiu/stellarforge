import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  const item = await prisma.observation.findUnique({
    where: { id: params.id },
    include: { object: true, site: true, gear: true },
  });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(req: Request, { params }: Params) {
  const body = await req.json();
  const item = await prisma.observation.update({ where: { id: params.id }, data: body });
  return NextResponse.json(item);
}

export async function DELETE(_req: Request, { params }: Params) {
  await prisma.observation.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
