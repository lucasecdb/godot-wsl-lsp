import * as path from "node:path";
import { promisify } from "node:util";
import * as cp from "node:child_process";
import { getCliOption } from "./cli-flags";

const WSLPATH_BIN = "wslpath";

const execFile = promisify(cp.execFile);

async function wslpath(args: string[]) {
  const { stdout } = await execFile(WSLPATH_BIN, args);

  return stdout.trim();
}

export function convertWindowsToWslPath(filePath: string): Promise<string> {
  if (getCliOption("experimentalFastPathConversion")) {
    const parsedPath = path.win32.parse(filePath);

    const drive = parsedPath.root.split(":")[0];

    return Promise.resolve(
      path.posix.join(
        BASE_MNT,
        drive,
        path.posix.relative(parsedPath.root, parsedPath.dir),
        parsedPath.base,
      ),
    );
  }

  return wslpath([filePath]);
}

const BASE_MNT = "/mnt";

export function convertWslToWindowsPath(filePath: string): Promise<string> {
  if (getCliOption("experimentalFastPathConversion")) {
    const relativeToMnt = path.relative(BASE_MNT, filePath);

    const [drive, ...file] = relativeToMnt.split(path.posix.sep);

    return Promise.resolve(
      `${drive}:${path.posix.sep}${file.join(path.posix.sep)}`,
    );
  }
  return wslpath(["-m", filePath]);
}
