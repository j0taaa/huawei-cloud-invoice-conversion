import { runLegacyAction } from "@/lib/legacyBridge";

export async function POST(request: Request) {
  const data = (await request.json()) as { region?: string };
  const region = data.region ?? "unknown";

  if (!data.region) {
    return new Response("Region is required.", { status: 400 });
  }

  try {
    await runLegacyAction("refresh-region", { region });
    return Response.json({ status: "refreshed", region });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to refresh region.";
    return new Response(message, { status: 500 });
  }
}
