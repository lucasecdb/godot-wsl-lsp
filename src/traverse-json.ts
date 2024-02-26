type JsonObject = Record<string, unknown> | Array<unknown>;

export async function traverseObject(
  obj: JsonObject,
  callback: (obj: JsonObject, key: string) => void | Promise<void>,
) {
  const stack: Array<{
    obj: JsonObject;
    path: string[];
  }> = [{ obj, path: [] }];

  while (stack.length) {
    const { obj: currentObj, path } = stack.pop()!;

    for (const key in currentObj) {
      const newPath = [...path, key];
      const value = Array.isArray(currentObj)
        ? currentObj[Number(key)]
        : currentObj[key];

      if (typeof value === "object" && value !== null) {
        stack.push({
          obj: value as JsonObject,
          path: newPath,
        });
      } else {
        await callback(currentObj, key);
      }
    }
  }
}
