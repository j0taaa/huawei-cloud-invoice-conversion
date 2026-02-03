import { cookies } from "next/headers";
import { updateInstance } from "@/lib/instances";

export async function POST(request: Request) {
  const body = await request.json();
  const cookieStore = cookies();
  const id = cookieStore.get("currentID")?.value;

  if (!id) {
    return new Response("No active session.", { status: 400 });
  }

  const startPage = Number(body.startPage);
  const startY = Number(body.startY);
  const endPage = Number(body.endPage);
  const endY = Number(body.endY);

  if ([startPage, startY, endPage, endY].some((value) => Number.isNaN(value))) {
    return new Response("Invalid coordinates.", { status: 400 });
  }

  updateInstance(id, { startPage, startY, endPage, endY });
  return Response.json({ status: "ok" });
}
