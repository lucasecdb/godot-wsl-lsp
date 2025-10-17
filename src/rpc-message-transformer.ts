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

  const uri = URI.parse(value);

  if (uri.scheme !== FILE_URI_SCHEME) {
    return value;
  }

  return uri.with({ path: await convertWslToWindowsPath(uri.path) }).toString();
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

  const uri = URI.parse(value);

  if (uri.scheme !== FILE_URI_SCHEME) {
    return value;
  }

  return uri.with({ path: await convertWindowsToWslPath(uri.path) }).toString();
}

export async function transformRpcForLinux(source: JsonObject) {
  return await transformObjectKeyAndValue(
    source,
    transformPathsForLinux,
    transformPathsForLinux,
  );
}
