import JSZip from "jszip";

function buildFileName(label: string, originalName: string, index: number) {
  const normalized = label.trim().replace(/[^\w.-]+/g, "_") || `excel-${index + 1}`;
  const extensionIndex = originalName.lastIndexOf(".");
  const extension = extensionIndex > -1 ? originalName.slice(extensionIndex) : ".xlsx";
  return normalized.endsWith(extension) ? normalized : `${normalized}${extension}`;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const files = formData.getAll("files");
  const labels = formData.getAll("labels").map((label) => String(label));

  if (!files.length) {
    return new Response("No files uploaded.", { status: 400 });
  }

  const zip = new JSZip();
  files.forEach((file, index) => {
    if (file instanceof File) {
      const label = labels[index] ?? file.name;
      const fileName = buildFileName(label, file.name, index);
      zip.file(fileName, file.arrayBuffer());
    }
  });

  const bundle = await zip.generateAsync({ type: "nodebuffer" });

  return new Response(bundle, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": "attachment; filename=\"excel-bundle.zip\""
    }
  });
}
