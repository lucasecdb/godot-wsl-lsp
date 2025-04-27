import { Writable, Duplex, Readable } from "node:stream";
import { JSONRPCTransform } from "ts-lsp-client";
import { JSONRPCClient, createJSONRPCRequest } from "json-rpc-2.0";

import {
  transformRpcForLinux,
  transformRpcForWindows,
} from "./rpc-message-transformer.js";
import { writeMessage } from "./rpc.js";
import { Logger } from "./logger.js";
import { Queue } from "./queue.js";

export class Server {
  private originInputStream: JSONRPCClient;
  private outputStream: JSONRPCClient;

  private originOutputStream: JSONRPCTransform;
  private inputStream: JSONRPCTransform;

  private inputQueue = new Queue<string>((value) => this.processInput(value));
  private outputQueue = new Queue<string>((value) => this.processOutput(value));

  constructor(
    private logger: Logger,
    private origin: Duplex,
    private input: Readable,
    private output: Writable,
  ) {
    this.originInputStream = new JSONRPCClient(async (rpcRequest) => {
      this.writeToStream(this.origin, rpcRequest);
    });
    this.outputStream = new JSONRPCClient(async (rpcResponse) => {
      this.writeToStream(this.output, rpcResponse);
    });

    this.originOutputStream = JSONRPCTransform.createStream(this.origin);
    this.inputStream = JSONRPCTransform.createStream(this.input);
  }

  private async processInput(request: string) {
    const rpcMessage = (await transformRpcForWindows(JSON.parse(request))) as {
      id: string;
      method: string;
      params: unknown;
    };

    const rpcRequest = createJSONRPCRequest(
      rpcMessage.id,
      rpcMessage.method,
      rpcMessage.params,
    );

    this.originInputStream.send(rpcRequest);
  }

  private async processOutput(result: string) {
    const rpcResult = await transformRpcForLinux(JSON.parse(result));

    if (Array.isArray(result) && result.length === 0) {
      return;
    }

    this.outputStream.send(rpcResult);
  }

  listen() {
    this.inputStream.on("data", async (request: string) => {
      this.inputQueue.enqueue(request);
    });

    this.originOutputStream.on("data", async (result: string) => {
      this.outputQueue.enqueue(result);
    });
  }

  private writeToStream(stream: Writable, request: object) {
    const requestStr = JSON.stringify(request);

    writeMessage(stream, requestStr);
  }
}
