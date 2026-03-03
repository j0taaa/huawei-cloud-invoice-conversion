import { spawn } from "child_process";

export async function runPython(scriptPath: string, args: string[]) {
  const candidates = [
    process.env.PYTHON_BIN,
    "/usr/local/bin/python3",
    "/usr/bin/python3",
    "python3",
    "python",
    "py"
  ].filter((value): value is string => Boolean(value));
  let missingBinaryError: Error | undefined;

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
      const knownError = error instanceof Error ? error : new Error("Unknown python error.");
      const errorCode = (knownError as NodeJS.ErrnoException).code;
      if (errorCode === "ENOENT") {
        missingBinaryError = knownError;
        continue;
      }
      throw knownError;
    }
  }

  throw (
    missingBinaryError ??
    new Error(
      "Unable to locate a Python interpreter. Set PYTHON_BIN or install python3."
    )
  );
}
