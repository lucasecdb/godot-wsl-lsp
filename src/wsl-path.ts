import * as path from "node:path";
import { promisify } from "node:util";
import * as cp from "node:child_process";
import { getCliOption } from "./cli-flags.js";

const WSLPATH_BIN = "wslpath";
const BASE_MNT = "/mnt";

const execFile = promisify(cp.execFile);

async function wslpath(args: string[]) {
  const { stdout } = await execFile(WSLPATH_BIN, args);

  return stdout.trim();
}

export async function convertWindowsToWslPath(
  filePath: string,
): Promise<string> {
  if (getCliOption("experimentalFastPathConversion")) {
    const parsedPath = path.win32.parse(filePath);

    const drive = parsedPath.root.split(":")[0];

    return path.posix.join(
      BASE_MNT,
      drive.toLowerCase(),
      path.posix.relative(parsedPath.root, parsedPath.dir),
      parsedPath.base,
    );
  }

  return wslpath([filePath]);
}

export async function convertWslToWindowsPath(
  filePath: string,
): Promise<string> {
  if (getCliOption("experimentalFastPathConversion")) {
    const relativeToMnt = path.relative(BASE_MNT, filePath);

    const [drive, ...file] = relativeToMnt.split(path.posix.sep);

    return path.posix.join(`${drive.toUpperCase()}:`, ...file);
  }
  return wslpath(["-m", filePath]);
}
