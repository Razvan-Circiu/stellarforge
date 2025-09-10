import { prisma } from "@/lib/prisma";

export async function GET() {
  const rows = await prisma.object.findMany({ orderBy: { createdAt: "desc" } });
  const header = "catalog,code,name,type,raDeg,decDeg,magnitude,constellation\n";
  const csv = header + rows.map(o=>[
    o.catalog, o.code, o.name, o.type, o.raDeg, o.decDeg,
    o.magnitude ?? "", o.constellation ?? ""
  ].map(v=> typeof v === "string" && v.includes(",") ? `"${v.replace(/"/g,'""')}"` : String(v)).join(",")).join("\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="objects.csv"',
    },
  });
}
