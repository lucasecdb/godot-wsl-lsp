import { URI } from "vscode-uri";

import {
  type JsonObject,
  transformObjectKeyAndValue,
} from "./traverse-json.js";
import {
  convertWindowsToWslPath,
  convertWslToWindowsPath,
} from "./wsl-path.js";

const FILE_URI_SCHEME = "file";

async function transformPathsForWindows<T>(value: T) {
  if (typeof value !== "string") {
    return value;
  }

  try {
    const uri = URI.parse(value, true);

    if (uri.scheme !== FILE_URI_SCHEME) {
      // Only convert file paths
      return value;
    }

    return uri
      .with({ path: await convertWslToWindowsPath(uri.path) })
      .toString();
  } catch {
    // failing to parse the string as an URI indicates that this
    // is not a file path, and should not be converted.
    return value;
  }
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

  try {
    const uri = URI.parse(value, true);

    if (uri.scheme !== FILE_URI_SCHEME) {
      // Only convert file paths
      return value;
    }

    return uri
      .with({
        path: await convertWindowsToWslPath(uri.fsPath),
      })
      .toString();
  } catch {
    // failing to parse the string as an URI indicates that this
    // is not a file path, and should not be converted.
    return value;
  }
}

export async function transformRpcForLinux(source: JsonObject) {
  return await transformObjectKeyAndValue(
    source,
    transformPathsForLinux,
    transformPathsForLinux,
  );
}
