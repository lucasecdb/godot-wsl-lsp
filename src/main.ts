import { createLogger } from "./logger.js";
import { LspSocket } from "./lsp-socket.js";
import { Server } from "./server.js";

const logger = createLogger(process.stdout);

const lspSocket = new LspSocket(logger);

const clientSocket = await lspSocket.createLspSocket();

const server = new Server(logger, clientSocket, process.stdin, process.stdout);

server.listen();
