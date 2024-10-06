import yargs from "yargs";
import { hideBin } from "yargs/helpers";

interface CliOptions {
  useMirroredNetworking: boolean;
  host?: string;
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
  .help().argv) satisfies CliOptions;

export function getCliOption<T extends keyof CliOptions>(
  name: T,
): CliOptions[T] {
  return argv[name] as CliOptions[T];
}
