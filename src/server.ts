#!/usr/bin/env node

import * as path from "node:path";
import { JSONRPCTransform } from "ts-lsp-client";
import { JSONRPCClient, createJSONRPCRequest } from "json-rpc-2.0";

import { createLspSocket } from "./lsp-socket.js";
import { traverseObject } from "./traverse-json.js";
import {
  convertWindowsToWslPath,
  convertWslToWindowsPath,
} from "./wsl-path.js";

const FILE_URI_IDENTIFIER = "file://";

const clientSocket = await createLspSocket();

const rpcClient = new JSONRPCClient(async (rpcRequest) => {
  const requestStr = JSON.stringify(rpcRequest);

  clientSocket.write(
    `Content-Length: ${requestStr.length}\r\n\r\n${requestStr}`,
  );
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

  rpcClient.requestAdvanced(rpcRequest).then((result) => {
    if (Array.isArray(result) && result.length === 0) {
      return;
    }

    return traverseObject(result.result, async (obj, key) => {
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
      const resultStr = JSON.stringify(result);

      process.stdout.write(
        `Content-Length: ${resultStr.length}\r\n\r\n${resultStr}`,
      );
    });
  });
});

socketStream.on("data", (result: string) => {
  const rpcResult = JSON.parse(result);

  rpcClient.receive(rpcResult);
});
