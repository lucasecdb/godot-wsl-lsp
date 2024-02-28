import * as path from "node:path";

import { traverseObject, type JsonObject } from "./traverse-json.js";
import {
  convertWindowsToWslPath,
  convertWslToWindowsPath,
} from "./wsl-path.js";

const FILE_URI_IDENTIFIER = "file://";

export async function mutateRpcForWindows(source: JsonObject) {
  await traverseObject(source, async (obj, key) => {
    const value = Array.isArray(obj) ? obj[Number(key)] : obj[key];

    if (typeof value !== "string") {
      return;
    }

    if (!value.startsWith(FILE_URI_IDENTIFIER)) {
      return;
    }

    (obj as Record<string, unknown>)[key] =
      FILE_URI_IDENTIFIER +
      path.posix.sep +
      (await convertWslToWindowsPath(value.slice(FILE_URI_IDENTIFIER.length)));
  });
}

export async function mutateRpcForLinux(source: JsonObject) {
  await traverseObject(source, async (obj, key) => {
    const value = Array.isArray(obj) ? obj[Number(key)] : obj[key];

    if (typeof value !== "string") {
      return;
    }

    if (!value.startsWith(FILE_URI_IDENTIFIER)) {
      return;
    }

    (obj as Record<string, unknown>)[key] =
      FILE_URI_IDENTIFIER +
      (await convertWindowsToWslPath(
        value.slice((FILE_URI_IDENTIFIER + path.posix.sep).length),
      ));
  });
}
