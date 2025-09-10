import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const rows = await prisma.observation.findMany({
    orderBy: { createdAt: "desc" },
    include: { object: true, site: true, gear: true },
  });
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const data = await req.json();
  if (!data?.objectId || !data?.date) {
    return NextResponse.json({ error: "objectId & date required" }, { status: 400 });
  }
  const created = await prisma.observation.create({ data });
  return NextResponse.json(created, { status: 201 });
}
