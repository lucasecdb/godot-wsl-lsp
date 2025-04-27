import yargs from "yargs";
import { hideBin } from "yargs/helpers";

interface CliOptions {
  useMirroredNetworking: boolean;
  host?: string;
  experimentalFastPathConversion: boolean;
}

const argv = (await yargs(hideBin(process.argv))
  .option("useMirroredNetworking", {
    type: "boolean",
    description: "Use mirrored networking",
    default: false,
  })
  .option("host", {
    type: "string",
    description: "Manually specify the host address",
  })
  .option("experimentalFastPathConversion", {
    type: "boolean",
    description:
      "[EXPERIMENTAL] Uses heuristical algorithm to convert paths between Windows-to-Linux format, " +
      "without invoking `wslpath` in order to increase response times.",
    default: false,
  })
  .help().argv) satisfies CliOptions;

export function getCliOption<T extends keyof CliOptions>(
  name: T,
): CliOptions[T] {
  return argv[name] as CliOptions[T];
}
