// Note: Consider using for example yargs if adding more flags (especially
//       ones that should contain values of type other than boolean).

type CliFlag = "--useMirroredNetworking";

export function gotCliFlag(flag: CliFlag): boolean {
  return process.argv.slice(2).includes(flag);
}
