import { cookies } from "next/headers";
import { requireInstance } from "@/lib/instances";
import { runLegacyAction } from "@/lib/legacyBridge";

export async function GET() {
  const cookieStore = cookies();
  const id = cookieStore.get("currentID")?.value;

  if (!id) {
    return new Response("No active session.", { status: 400 });
  }

  const instance = requireInstance(id);

  try {
    const result = await runLegacyAction<{ mode: string; options: unknown[] }>("ecs-options", {
      data: instance.data,
      region: instance.region
    });

    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load ECS options.";
    return new Response(message, { status: 500 });
  }
}
