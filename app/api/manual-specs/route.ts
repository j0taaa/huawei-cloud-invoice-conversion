import { cookies } from "next/headers";
import { createInstance } from "@/lib/instances";

function buildSpecs(message: string) {
  const numbers = message.match(/\d+(?:\.\d+)?/g) ?? [];
  const specs = [] as Array<Record<string, string | number>>;
  for (let i = 0; i < numbers.length - 2; i += 3) {
    const vcpus = Number(numbers[i]);
    const memory = Number(numbers[i + 1]);
    const usage = Number(numbers[i + 2]);
    specs.push({
      flavor: `nAWS${i}`,
      vcpus,
      memory,
      usage,
      family: `nAWS${i}`,
      name: `nAWS${i}`,
      kind: "ecs",
      type: `nAWS${i}`
    });
  }
  return specs;
}

export async function POST(request: Request) {
  const body = await request.json();
  const message = String(body.message || "");

  if (!message.trim()) {
    return new Response("Message is required.", { status: 400 });
  }

  const data = buildSpecs(message);
  const instance = createInstance("Manual specs");
  instance.data = data;

  const cookieStore = cookies();
  cookieStore.set("currentID", instance.id, {
    maxAge: 60 * 60 * 24,
    path: "/"
  });

  return Response.json({ status: "ok", id: instance.id, count: data.length });
}
