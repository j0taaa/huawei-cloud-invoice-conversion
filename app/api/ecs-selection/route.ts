import { cookies } from "next/headers";
import { requireInstance } from "@/lib/instances";

export async function POST(request: Request) {
  const body = await request.json();
  const selections = (body.selections ?? {}) as Record<string, string>;
  const cookieStore = cookies();
  const id = cookieStore.get("currentID")?.value;

  if (!id) {
    return new Response("No active session.", { status: 400 });
  }

  const instance = requireInstance(id);
  const updated = instance.data.map((item) => {
    if (item.type && selections[item.type]) {
      return { ...item, type: selections[item.type] };
    }
    return item;
  });

  const merged: typeof updated = [];
  const ecsMap = new Map<string, typeof updated[number]>();
  for (const item of updated) {
    if (item.kind !== "ecs") {
      merged.push(item);
      continue;
    }
    const key = item.type;
    if (!key) {
      merged.push(item);
      continue;
    }
    const existing = ecsMap.get(key);
    if (existing && typeof existing.usage === "number" && typeof item.usage === "number") {
      existing.usage += item.usage;
    } else if (existing) {
      ecsMap.set(key, { ...item });
    } else {
      ecsMap.set(key, { ...item });
    }
  }

  merged.push(...ecsMap.values());
  instance.data = merged;

  return Response.json({ status: "ok" });
}
