export type JsonObject = Record<string, unknown> | Array<unknown>;

export async function transformObjectKeyAndValue(
  root: JsonObject,
  transformKey: (key: string) => Promise<string> | string,
  transformValue: (value: unknown | null) => Promise<unknown> | unknown,
) {
  async function traverse(obj: JsonObject): Promise<JsonObject> {
    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        const value = obj[i];

        if (typeof value !== "object" || value == null) {
          obj[i] = await transformValue(value);
        } else {
          obj[i] = await traverse(value as JsonObject);
        }
      }

      return obj;
    } else {
      const keys = Object.keys(obj);

      for (const key of keys) {
        const value = obj[key];

        delete obj[key];

        const newKey = await transformKey(key);

        if (typeof value !== "object" || value == null) {
          obj[newKey] = await transformValue(value);
        } else {
          obj[newKey] = await traverse(value as JsonObject);
        }
      }

      return obj;
    }
  }

  return await traverse(root);
}
