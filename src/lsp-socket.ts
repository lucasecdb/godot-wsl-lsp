import * as os from "node:os";
import * as dns from "node:dns/promises";
import * as net from "node:net";
import { getCliOption } from "./cli-flags.js";
import { Logger } from "./logger.js";

export class LspSocket {
  constructor(private logger: Logger) {}

  private async getWindowsHostAddress() {
    const manualHost = getCliOption("host");
    if (manualHost) {
      this.logger.debug(`Using manually specified host: ${manualHost}`);
      return manualHost;
    }

    const useMirroredNetworking = getCliOption("useMirroredNetworking");
    const host = useMirroredNetworking ? "localhost" : os.hostname() + ".local";

    this.logger.debug("Searching windows host address");

    const address = (await dns.lookup(host)).address;

    this.logger.debug(`Found address ${address}`);

    return address;
  }

  private getGodotPort() {
    const port = parseInt(process.env["GDScript_Port"] || "6005", 10);

    return port;
  }

  public async createLspSocket() {
    const port = this.getGodotPort();
    const address = await this.getWindowsHostAddress();

    this.logger.debug("Connecting to Godot LSP");

    const clientSocket = await new Promise<net.Socket>((resolve) => {
      const socket = net.createConnection(port, address, () => {
        this.logger.debug("Connected");
        resolve(socket);
      });
    });

    return clientSocket;
  }
}
