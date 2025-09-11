import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";


export async function GET() {
  const items = await prisma.observation.findMany({
    orderBy: { createdAt: "desc" },
    include: { object: true, site: true, gear: true },
  });
  return NextResponse.json(items);
}

type RawObs = {
  objectId?: string;
  siteId?: string | null;
  gearId?: string | null;
  date?: string | Date;
  seeing?: number | string | null;
  transparency?: number | string | null;
  moonPhase?: number | string | null;
  description?: string | null;
  imageUrl?: string | null;
};

function toNumberOrNull(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function normalize(raw: RawObs) {
  const data: any = {};

  if (typeof raw.objectId === "string") data.objectId = raw.objectId.trim();

  if (raw.date instanceof Date) data.date = raw.date;
  else if (typeof raw.date === "string") data.date = new Date(raw.date);

  const siteId =
    typeof raw.siteId === "string" ? raw.siteId.trim() : raw.siteId ?? null;
  data.siteId = siteId === "" ? null : siteId;

  const gearId =
    typeof raw.gearId === "string" ? raw.gearId.trim() : raw.gearId ?? null;
  data.gearId = gearId === "" ? null : gearId;

  const seeing = toNumberOrNull(raw.seeing);
  if (seeing !== null) data.seeing = seeing;

  const transparency = toNumberOrNull(raw.transparency);
  if (transparency !== null) data.transparency = transparency;

  const moonPhase = toNumberOrNull(raw.moonPhase);
  if (moonPhase !== null) data.moonPhase = moonPhase;

  if (typeof raw.description === "string") data.description = raw.description;
  if (typeof raw.imageUrl === "string" && raw.imageUrl.trim() !== "")
    data.imageUrl = raw.imageUrl.trim();

  return data;
}

export async function POST(req: Request) {
  try {
    const raw = (await req.json()) as RawObs;
    const data = normalize(raw);

    if (!data.objectId) {
      return NextResponse.json(
        { error: "objectId este obligatoriu" },
        { status: 400 }
      );
    }
    if (!(data.date instanceof Date) || isNaN(+data.date)) {
      return NextResponse.json(
        { error: "date este obligatoriu și trebuie să fie valid" },
        { status: 400 }
      );
    }

    const exists = await prisma.object.findUnique({
      where: { id: data.objectId },
      select: { id: true },
    });
    if (!exists) {
      return NextResponse.json(
        { error: "objectId invalid (obiectul nu există)" },
        { status: 400 }
      );
    }

    const created = await prisma.observation.create({ data });
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    if (err?.code === "P2003") {
      return NextResponse.json(
        {
          error:
            "Cheie străină invalidă pentru objectId/siteId/gearId (FK constraint failed)",
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: err?.message ?? "Eroare internă" },
      { status: 500 }
    );
  }
}
