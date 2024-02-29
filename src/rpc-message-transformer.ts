import * as path from "node:path";

import {
  type JsonObject,
  transformObjectKeyAndValue,
} from "./traverse-json.js";
import {
  convertWindowsToWslPath,
  convertWslToWindowsPath,
} from "./wsl-path.js";

const FILE_URI_IDENTIFIER = "file://";

async function transformPathsForWindows<T>(value: T) {
  if (typeof value !== "string") {
    return value;
  }

  if (!value.startsWith(FILE_URI_IDENTIFIER)) {
    return value;
  }

  return (
    FILE_URI_IDENTIFIER +
    path.posix.sep +
    (await convertWslToWindowsPath(value.slice(FILE_URI_IDENTIFIER.length)))
  );
}

export async function transformRpcForWindows(source: JsonObject) {
  return await transformObjectKeyAndValue(
    source,
    transformPathsForWindows,
    transformPathsForWindows,
  );
}

async function transformPathsForLinux<T>(value: T) {
  if (typeof value !== "string") {
    return value;
  }

  if (!value.startsWith(FILE_URI_IDENTIFIER)) {
    return value;
  }

  return (
    FILE_URI_IDENTIFIER +
    (await convertWindowsToWslPath(
      value.slice((FILE_URI_IDENTIFIER + path.posix.sep).length),
    ))
  );
}

export async function transformRpcForLinux(source: JsonObject) {
  return await transformObjectKeyAndValue(
    source,
    transformPathsForLinux,
    transformPathsForLinux,
  );
}
