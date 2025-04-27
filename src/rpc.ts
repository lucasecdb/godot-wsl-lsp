import { Writable } from "stream";

export function writeMessage(stream: Writable, message: string) {
  stream.write(
    `Content-Length: ${Buffer.byteLength(message, "utf-8")}\r\n\r\n${message}`,
  );
}
