export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region") ?? "unknown-region";

  const code = `// Huawei Cloud price calculator automation\n// Target region: ${region}\nconsole.log('Loading items for region: ${region}');`;

  return Response.json({ code });
}
