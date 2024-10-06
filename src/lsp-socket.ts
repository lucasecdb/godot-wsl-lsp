import * as os from "node:os";
import * as dns from "node:dns/promises";
import * as net from "node:net";
import { getCliOption } from "./cli-flags.js";
import { logger } from "./logger.js";

export async function getWindowsHostAddress() {
  const manualHost = getCliOption("host");
  if (manualHost) {
    logger.debug(`Using manually specified host: ${manualHost}`);
    return manualHost;
  }

  const useMirroredNetworking = getCliOption("useMirroredNetworking");
  const host = useMirroredNetworking ? "localhost" : os.hostname() + ".local";

  const address = (await dns.lookup(host)).address;

  return address;
}

export function getGodotPort() {
  const port = parseInt(process.env["GDScript_Port"] || "6005", 10);

  return port;
}

export async function createLspSocket(address: string, port: number) {
  const clientSocket = await new Promise<net.Socket>((resolve) => {
    const socket = net.createConnection(port, address, () => {
      resolve(socket);
    });
  });

  return clientSocket;
}
