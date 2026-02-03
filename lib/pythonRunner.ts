import { spawn } from "child_process";

export async function runPython(scriptPath: string, args: string[]) {
  const candidates = ["/usr/bin/python3", "python3", "python"];
  let lastError: Error | undefined;

  for (const candidate of candidates) {
    try {
      const output = await new Promise<string>((resolve, reject) => {
        const process = spawn(candidate, [scriptPath, ...args], {
          stdio: ["ignore", "pipe", "pipe"]
        });
        let stdout = "";
        let stderr = "";
        process.stdout.on("data", (chunk) => {
          stdout += chunk.toString();
        });
        process.stderr.on("data", (chunk) => {
          stderr += chunk.toString();
        });
        process.on("error", (error) => {
          reject(error);
        });
        process.on("close", (code) => {
          if (code === 0) {
            resolve(stdout.trim());
          } else {
            reject(new Error(stderr || `Python exited with code ${code}`));
          }
        });
      });
      return output;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown python error.");
    }
  }

  throw lastError ?? new Error("Unable to locate a Python interpreter.");
}
