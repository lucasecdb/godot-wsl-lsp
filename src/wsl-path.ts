import { promisify } from "node:util";
import * as cp from "node:child_process";

const WSLPATH_BIN = "wslpath";

const execFile = promisify(cp.execFile);

async function wslpath(args: string[]) {
  const { stdout } = await execFile(WSLPATH_BIN, args);

  return stdout.trim();
}

export function convertWindowsToWslPath(filePath: string) {
  return wslpath([filePath]);
}

export function convertWslToWindowsPath(filePath: string) {
  return wslpath(["-m", filePath]);
}
