import * as path from "node:path";
import { Writable } from "node:stream";
import { JSONRPCTransform } from "ts-lsp-client";
import { JSONRPCClient, createJSONRPCRequest } from "json-rpc-2.0";

import { createLspSocket } from "./lsp-socket.js";
import { traverseObject } from "./traverse-json.js";
import {
  convertWindowsToWslPath,
  convertWslToWindowsPath,
} from "./wsl-path.js";
import { logger } from "./logger.js";

const FILE_URI_IDENTIFIER = "file://";

const clientSocket = await createLspSocket();

function writeToStream(stream: Writable, request: object) {
  const requestStr = JSON.stringify(request);

  stream.write(`Content-Length: ${requestStr.length}\r\n\r\n${requestStr}`);
}

const rpcClient = new JSONRPCClient(async (rpcRequest) => {
  writeToStream(clientSocket, rpcRequest);
});

const stdinStream = JSONRPCTransform.createStream(process.stdin);
const socketStream = JSONRPCTransform.createStream(clientSocket);

stdinStream.on("data", async (request: string) => {
  const rpcMessage = JSON.parse(request);

  await traverseObject(rpcMessage, async (obj, key) => {
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

  const rpcRequest = createJSONRPCRequest(
    rpcMessage.id,
    rpcMessage.method,
    rpcMessage.params,
  );

  logger.debug(`Sending request to server ${JSON.stringify(rpcRequest)}`);

  rpcClient.requestAdvanced(rpcRequest).then((result) => {
    if (Array.isArray(result) && result.length === 0) {
      return;
    }

    writeToStream(process.stdout, result);
  });
});

socketStream.on("data", (result: string) => {
  logger.debug(`Received server response ${JSON.stringify(result)}`);

  const rpcResult = JSON.parse(result);

  traverseObject(rpcResult, async (obj, key) => {
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
  }).then(() => {
    if (rpcResult.id) {
      rpcClient.receive(rpcResult);
    } else {
      writeToStream(process.stdout, rpcResult);
    }
  });
});
