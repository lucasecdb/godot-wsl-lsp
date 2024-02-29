export type JsonObject = Record<string, unknown> | Array<unknown>;

export async function transformObjectKeyAndValue(
  root: JsonObject,
  transformKey: (key: string) => Promise<string> | string,
  transformValue: (value: unknown | null) => Promise<unknown> | unknown,
) {
  async function traverse(obj: JsonObject): Promise<JsonObject> {
    if (Array.isArray(obj)) {
      return await Promise.all(
        obj.map(async (value) =>
          typeof value !== "object" || value == null
            ? await transformValue(value)
            : await traverse(value as JsonObject),
        ),
      );
    } else {
      const entries = Object.entries(obj);

      return Object.fromEntries(
        await Promise.all(
          entries.map(async ([key, value]) => [
            await transformKey(key),
            typeof value !== "object" || value == null
              ? await transformValue(value)
              : await traverse(value as JsonObject),
          ]),
        ),
      );
    }
  }

  return await traverse(root);
}
