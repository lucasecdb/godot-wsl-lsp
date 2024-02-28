import * as os from "node:os";
import * as dns from "node:dns/promises";
import { AnyARecord } from "node:dns";
import * as net from "node:net";

export async function getWindowsHostAddress() {
  const host = os.hostname() + ".local";
  const address = (
    (await dns.resolveAny(host)).find(
      (entry) => entry.type === "A",
    ) as AnyARecord
  ).address;

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
