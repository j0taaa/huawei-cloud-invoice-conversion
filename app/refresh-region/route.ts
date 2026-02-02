export async function POST(request: Request) {
  let region = "unknown";
  try {
    const data = (await request.json()) as { region?: string };
    if (data.region) {
      region = data.region;
    }
  } catch {
    // ignore malformed body
  }

  return Response.json({
    status: "refreshed",
    region
  });
}
