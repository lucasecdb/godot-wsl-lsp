import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const argv = (await yargs(hideBin(process.argv))
  .option("useMirroredNetworking", {
    type: "boolean",
    description: "Use mirrored networking",
  })
  .option("host", {
    type: "string",
    description: "Manually specify the host address",
  })
  .help().argv) satisfies { [key: string]: any };

export function gotCliFlag(flag: string): boolean {
  return Boolean(argv[flag]);
}

export function getCliOption(option: string): string {
  return String(argv[option]);
}
