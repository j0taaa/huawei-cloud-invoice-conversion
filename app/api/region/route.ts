import { cookies } from "next/headers";
import { updateInstance } from "@/lib/instances";

export async function POST(request: Request) {
  const body = await request.json();
  const region = String(body.region || "").trim();
  const cookieStore = cookies();
  const id = cookieStore.get("currentID")?.value;

  if (!id) {
    return new Response("No active session.", { status: 400 });
  }

  if (!region) {
    return new Response("Region is required.", { status: 400 });
  }

  updateInstance(id, { region });
  return Response.json({ status: "ok", region });
}
