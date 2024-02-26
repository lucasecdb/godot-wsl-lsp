import * as cp from "node:child_process";

const WSLPATH_BIN = "/usr/bin/wslpath";

export async function convertWindowsToWslPath(
  filePath: string,
  options: string[] = [],
) {
  const child = cp.execFile(WSLPATH_BIN, [...options, filePath]);

  let buffer = "";

  child.stdout?.on("data", (data) => {
    buffer += data;
  });

  await new Promise<void>((resolve) => child.on("exit", () => resolve()));

  return buffer.trim();
}

export async function convertWslToWindowsPath(filePath: string) {
  return await convertWindowsToWslPath(filePath, ["-m"]);
}
