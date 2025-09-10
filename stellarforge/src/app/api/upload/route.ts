import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return Response.json({ error: "No file" }, { status: 400 });

  const bytes = new Uint8Array(await file.arrayBuffer());
  const dir = join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const fname = `${Date.now()}_${file.name.replace(/[^\w.\-]+/g,"_")}`;
  const full = join(dir, fname);
  await writeFile(full, bytes);
  return Response.json({ url: `/uploads/${fname}` });
}
