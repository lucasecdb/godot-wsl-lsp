import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const argv = yargs(hideBin(process.argv))
  .option("useMirroredNetworking", {
    type: "boolean",
    description: "Use mirrored networking",
  })
  .option("host", {
    type: "string",
    description: "Manually specify the host address",
  })
  .help().argv as { [key: string]: any }; // Explicitly typing argv

export function gotCliFlag(flag: string): boolean {
  return Boolean(argv[flag]);
}

export function getCliOption(option: string): string {
  return argv[option];
}
