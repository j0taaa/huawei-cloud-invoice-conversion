import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { runPython } from "@/lib/pythonRunner";

const LEGACY_SCRIPT = path.join(process.cwd(), "scripts", "legacy_bridge.py");

export async function runLegacyAction<T>(action: string, payload: Record<string, unknown>) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "legacy-bridge-"));
  const payloadPath = path.join(tempDir, "payload.json");
  const body = { action, ...payload };
  try {
    await fs.writeFile(payloadPath, JSON.stringify(body));
    const output = await runPython(LEGACY_SCRIPT, [payloadPath]);
    return JSON.parse(output) as T;
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}
