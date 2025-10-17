import { Writable, Duplex, Readable } from "node:stream";
import { JSONRPCTransform } from "ts-lsp-client";
import { JSONRPCClient } from "json-rpc-2.0";

import {
  transformRpcForLinux,
  transformRpcForWindows,
} from "./rpc-message-transformer.js";
import { writeMessage } from "./rpc.js";
import { Logger } from "./logger.js";
import { Queue } from "./queue.js";
import { JsonObject } from "./traverse-json.js";

export class Server {
  private originInputStream: JSONRPCClient;
  private originOutputStream: JSONRPCTransform;

  private selfInputStream: JSONRPCTransform;
  private selfOutputStream: JSONRPCClient;

  private inputQueue = new Queue<JsonObject>(
    (value) => this.processInput(value),
    this.logger,
  );
  private outputQueue = new Queue<JsonObject>(
    (value) => this.processOutput(value),
    this.logger,
  );

  constructor(
    private logger: Logger,
    private origin: Duplex,
    private input: Readable,
    private output: Writable,
  ) {
    this.originInputStream = new JSONRPCClient(async (rpcRequest) => {
      this.writeToStream(this.origin, rpcRequest);
    });
    this.originOutputStream = JSONRPCTransform.createStream(this.origin);

    this.selfInputStream = JSONRPCTransform.createStream(this.input);
    this.selfOutputStream = new JSONRPCClient(async (rpcResponse) => {
      this.writeToStream(this.output, rpcResponse);
    });
  }

  private async processInput(rpcRequest: JsonObject) {
    this.originInputStream.send(rpcRequest);
  }

  private async processOutput(result: JsonObject) {
    if (Array.isArray(result) && result.length === 0) {
      return;
    }

    this.selfOutputStream.send(result);
  }

  listen() {
    this.selfInputStream.on("data", async (request: string) => {
      this.inputQueue.enqueue(transformRpcForWindows(JSON.parse(request)));
    });

    this.originOutputStream.on("data", async (result: string) => {
      this.outputQueue.enqueue(transformRpcForLinux(JSON.parse(result)));
    });
  }

  private writeToStream(stream: Writable, request: object) {
    const requestStr = JSON.stringify(request);

    writeMessage(stream, requestStr);
  }
}
