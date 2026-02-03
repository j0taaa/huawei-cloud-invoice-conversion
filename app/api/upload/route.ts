import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { cookies } from "next/headers";
import { createInstance } from "@/lib/instances";

function sanitizeFileName(value: string, fallback: string) {
  const safeValue = value.replace(/[^a-z0-9._-]+/gi, "_");
  return safeValue.length ? safeValue : fallback;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return new Response("No file uploaded.", { status: 400 });
  }

  if (!file.name.toLowerCase().endsWith(".pdf")) {
    return new Response("Invalid file type. Only PDF files are allowed.", { status: 400 });
  }

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "invoice-pdf-"));
  const safeName = sanitizeFileName(file.name, "invoice.pdf");
  const filePath = path.join(tempDir, safeName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);

  const instance = createInstance(file.name, filePath);
  const cookieStore = cookies();
  cookieStore.set("currentID", instance.id, {
    maxAge: 60 * 60 * 24,
    path: "/"
  });

  return Response.json({ id: instance.id, filename: instance.filename });
}
