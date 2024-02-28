import {
  createLspSocket,
  getWindowsHostAddress,
  getGodotPort,
} from "./lsp-socket.js";
import { Server } from "./server.js";

const windowsAddress = await getWindowsHostAddress();
const port = getGodotPort();

const clientSocket = await createLspSocket(windowsAddress, port);

const server = new Server(clientSocket, process.stdin, process.stdout);

server.listen();
