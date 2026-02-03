import { promises as fs } from "fs";
import { getInstance } from "@/lib/instances";

export async function GET(
  _request: Request,
  context: { params: { id: string } }
) {
  const instance = getInstance(context.params.id);
  if (!instance?.filePath) {
    return new Response("File not found.", { status: 404 });
  }

  const fileBuffer = await fs.readFile(instance.filePath);
  return new Response(fileBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${instance.filename}"`
    }
  });
}
