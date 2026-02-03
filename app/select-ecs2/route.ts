import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireInstance } from "@/lib/instances";

export async function POST(request: Request) {
  const formData = await request.formData();
  const selections: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("flavor_")) {
      const name = key.replace("flavor_", "");
      selections[name] = String(value);
    }
  }

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
    } else {
      ecsMap.set(key, { ...item });
    }
  }

  merged.push(...ecsMap.values());
  instance.data = merged;

  return NextResponse.redirect(new URL("/success", request.url));
}
