import { Writable, Duplex, Readable } from "node:stream";
import { JSONRPCTransform } from "ts-lsp-client";
import { JSONRPCClient, createJSONRPCRequest } from "json-rpc-2.0";

import { logger } from "./logger.js";
import {
  transformRpcForLinux,
  transformRpcForWindows,
} from "./rpc-message-transformer.js";

export class Server {
  private rpcClient: JSONRPCClient;

  private originStream: JSONRPCTransform;
  private inputStream: JSONRPCTransform;

  constructor(
    private origin: Duplex,
    private input: Readable,
    private output: Writable,
  ) {
    this.rpcClient = new JSONRPCClient(async (rpcRequest) => {
      this.writeToStream(this.origin, rpcRequest);
    });

    this.originStream = JSONRPCTransform.createStream(this.origin);
    this.inputStream = JSONRPCTransform.createStream(this.input);
  }

  listen() {
    this.inputStream.on("data", async (request: string) => {
      const rpcMessage = (await transformRpcForWindows(
        JSON.parse(request),
      )) as { id: string; method: string; params: unknown };

      const rpcRequest = createJSONRPCRequest(
        rpcMessage.id,
        rpcMessage.method,
        rpcMessage.params,
      );

      logger.debug(`Sending request to server ${JSON.stringify(rpcRequest)}`);

      this.rpcClient.send(rpcRequest);
    });

    this.originStream.on("data", async (result: string) => {
      logger.debug(`Received server response ${result}`);

      const rpcResult = await transformRpcForLinux(JSON.parse(result));

      if (Array.isArray(result) && result.length === 0) {
        return;
      }

      this.writeToStream(this.output, rpcResult);
    });
  }

  private writeToStream(stream: Writable, request: object) {
    const requestStr = JSON.stringify(request);

    stream.write(`Content-Length: ${requestStr.length}\r\n\r\n${requestStr}`);
  }
}
