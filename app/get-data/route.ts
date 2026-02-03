import { cookies } from "next/headers";
import { requireInstance, setInstanceData } from "@/lib/instances";
import { runLegacyAction } from "@/lib/legacyBridge";

export async function GET() {
  const cookieStore = cookies();
  const id = cookieStore.get("currentID")?.value;
  if (!id) {
    return new Response("No active session.", { status: 400 });
  }

  const instance = requireInstance(id);
  if (!instance.filePath) {
    return new Response("No PDF uploaded for this session.", { status: 400 });
  }

  if ([instance.startPage, instance.startY, instance.endPage, instance.endY].some((v) => v < 0)) {
    return new Response("Select start/end positions before processing.", { status: 400 });
  }

  try {
    const result = await runLegacyAction<{ data: typeof instance.data }>("extract-data", {
      file: instance.filePath,
      startPage: instance.startPage,
      startY: instance.startY,
      endPage: instance.endPage,
      endY: instance.endY
    });

    setInstanceData(id, result.data);
    return Response.json({ status: "ok", processedAt: new Date().toISOString() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to process data.";
    return new Response(message, { status: 500 });
  }
}
