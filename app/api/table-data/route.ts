import { cookies } from "next/headers";
import { requireInstance } from "@/lib/instances";

export async function GET() {
  const cookieStore = cookies();
  const id = cookieStore.get("currentID")?.value;
  if (!id) {
    return new Response("No active session.", { status: 400 });
  }

  const instance = requireInstance(id);
  const data = instance.data.map((item) => {
    const next = { ...item };
    if (typeof next.usage === "number") {
      next.usage = Math.ceil(next.usage);
    }
    if (typeof next.requests === "number") {
      next.requests = Math.ceil(next.requests);
    }
    return next;
  });
  return Response.json({ data, region: instance.region });
}
