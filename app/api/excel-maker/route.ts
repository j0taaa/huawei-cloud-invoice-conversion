import { spawn } from "child_process";
import { promises as fs } from "fs";
import os from "os";
import path from "path";

const PYTHON_SCRIPT = path.join(process.cwd(), "scripts", "excel_maker.py");

function sanitizeFileName(value: string, fallback: string) {
  const safeValue = value.replace(/[^a-z0-9._-]+/gi, "_");
  return safeValue.length ? safeValue : fallback;
}

async function runPython(payloadPath: string) {
  const candidates = ["/usr/bin/python3", "python3", "python"];
  let lastError: Error | undefined;

  for (const candidate of candidates) {
    try {
      await new Promise<void>((resolve, reject) => {
        const process = spawn(candidate, [PYTHON_SCRIPT, payloadPath], {
          stdio: ["ignore", "pipe", "pipe"]
        });
        let errorOutput = "";
        process.stderr.on("data", (chunk) => {
          errorOutput += chunk.toString();
        });
        process.on("error", (error) => {
          reject(error);
        });
        process.on("close", (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(errorOutput || `Python exited with code ${code}`));
          }
        });
      });
      return;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown python error.");
    }
  }

  throw lastError ?? new Error("Unable to locate a Python interpreter.");
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const files = formData.getAll("files");
  const labels = formData.getAll("labels").map((label) => String(label));

  if (!files.length) {
    return new Response("No files uploaded.", { status: 400 });
  }

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "excel-maker-"));
  const outputPath = path.join(tempDir, "combined-excel.xlsx");
  const payloadPath = path.join(tempDir, "payload.json");
  const payloadFiles: Array<{ path: string; title: string }> = [];

  try {
    for (const [index, file] of files.entries()) {
      if (!(file instanceof File)) {
        continue;
      }
      const label = labels[index] ?? file.name;
      const safeName = sanitizeFileName(file.name, `upload-${index + 1}.xlsx`);
      const filePath = path.join(tempDir, `${index + 1}-${safeName}`);
      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(filePath, buffer);
      payloadFiles.push({ path: filePath, title: label });
    }

    if (!payloadFiles.length) {
      return new Response("No valid Excel files uploaded.", { status: 400 });
    }

    await fs.writeFile(
      payloadPath,
      JSON.stringify({ output: outputPath, files: payloadFiles }, null, 2)
    );

    await runPython(payloadPath);

    const combinedWorkbook = await fs.readFile(outputPath);
    return new Response(combinedWorkbook, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=\"combined-excel.xlsx\""
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate Excel workbook.";
    return new Response(message, { status: 500 });
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}
