import * as XLSX from "xlsx";

const MAX_SHEET_NAME_LENGTH = 31;

function sanitizeSheetName(value: string, fallback: string) {
  const sanitized = value.replace(/[:\\/?*[\]]/g, "_").trim() || fallback;
  return sanitized.slice(0, MAX_SHEET_NAME_LENGTH);
}

function uniqueSheetName(baseName: string, usedNames: Set<string>) {
  let name = baseName;
  let counter = 1;
  while (usedNames.has(name)) {
    const suffix = `_${counter}`;
    name = `${baseName.slice(0, MAX_SHEET_NAME_LENGTH - suffix.length)}${suffix}`;
    counter += 1;
  }
  usedNames.add(name);
  return name;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const files = formData.getAll("files");
  const labels = formData.getAll("labels").map((label) => String(label));

  if (!files.length) {
    return new Response("No files uploaded.", { status: 400 });
  }

  const workbook = XLSX.utils.book_new();
  const usedSheetNames = new Set<string>();
  let processed = 0;

  for (const [index, file] of files.entries()) {
    if (!(file instanceof File)) {
      continue;
    }
    const label = labels[index] ?? file.name;
    const arrayBuffer = await file.arrayBuffer();
    const sourceWorkbook = XLSX.read(arrayBuffer, { type: "array" });
    sourceWorkbook.SheetNames.forEach((sheetName, sheetIndex) => {
      const sheet = sourceWorkbook.Sheets[sheetName];
      if (!sheet) {
        return;
      }
      const fallbackName = `${label || "Sheet"}-${sheetIndex + 1}`;
      const baseName = sanitizeSheetName(`${label}-${sheetName}`, fallbackName);
      const uniqueName = uniqueSheetName(baseName, usedSheetNames);
      XLSX.utils.book_append_sheet(workbook, sheet, uniqueName);
    });
    processed += 1;
  }

  if (!processed) {
    return new Response("No valid Excel files uploaded.", { status: 400 });
  }

  const combinedWorkbook = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

  return new Response(combinedWorkbook, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=\"combined-excel.xlsx\""
    }
  });
}
