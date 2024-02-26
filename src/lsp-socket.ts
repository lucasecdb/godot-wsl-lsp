import * as os from "node:os";
import * as dns from "node:dns/promises";
import { AnyARecord } from "node:dns";
import * as net from "node:net";

export async function createLspSocket() {
  const host = os.hostname() + ".local";
  const address = (
    (await dns.resolveAny(host)).find(
      (entry) => entry.type === "A",
    ) as AnyARecord
  ).address;

  const port = parseInt(process.env["GDScript_Port"] || "6005", 10);

  const clientSocket = await new Promise<net.Socket>((resolve) => {
    const socket = net.createConnection(port, address, () => {
      resolve(socket);
    });
  });

  return clientSocket;
}
