import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const rows = await prisma.gear.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const data = await req.json();
  if (!data?.type || !data?.model) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const created = await prisma.gear.create({ data });
  return NextResponse.json(created, { status: 201 });
}
