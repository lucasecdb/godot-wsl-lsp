import { createLogger } from "./logger.js";
import { LspSocket } from "./lsp-socket.js";
import { ProgressReporter } from "./progress-reporter.js";
import { Server } from "./server.js";

async function main() {
  const logger = createLogger(process.stdout);

  const lspSocket = new LspSocket(logger);

  const progressReporter = new ProgressReporter(process.stdout);

  const connectionReporter = progressReporter.workBegin({
    title: "Connecting to Godot",
    cancellable: false,
    percentage: 0,
  });

  const clientSocket = await lspSocket.createLspSocket(
    (message, percentage) => {
      connectionReporter.reportWork({
        message,
        percentage,
      });
    },
  );

  connectionReporter.workEnd({
    message: "Success",
  });

  const server = new Server(
    logger,
    clientSocket,
    process.stdin,
    process.stdout,
  );

  server.listen();
}

await main();
