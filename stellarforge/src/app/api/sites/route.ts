import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const rows = await prisma.site.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const data = await req.json();
  if (!data?.name || typeof data?.lat !== "number" || typeof data?.lon !== "number" || typeof data?.bortle !== "number") {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const created = await prisma.site.create({ data });
  return NextResponse.json(created, { status: 201 });
}
