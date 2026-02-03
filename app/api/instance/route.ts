import { cookies } from "next/headers";
import { getInstance } from "@/lib/instances";

export async function GET() {
  const cookieStore = cookies();
  const id = cookieStore.get("currentID")?.value;
  if (!id) {
    return new Response("No active session.", { status: 404 });
  }
  const instance = getInstance(id);
  if (!instance) {
    return new Response("Session not found.", { status: 404 });
  }

  return Response.json({
    id: instance.id,
    filename: instance.filename,
    region: instance.region,
    startPage: instance.startPage,
    startY: instance.startY,
    endPage: instance.endPage,
    endY: instance.endY,
    data: instance.data,
    pdfUrl: instance.filePath ? `/api/pdf/${instance.id}` : null
  });
}
