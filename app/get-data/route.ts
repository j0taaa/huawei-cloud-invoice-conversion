export async function GET() {
  return Response.json({
    status: "ok",
    processedAt: new Date().toISOString()
  });
}
