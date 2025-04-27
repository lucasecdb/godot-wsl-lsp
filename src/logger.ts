import { Writable } from "node:stream";
import { writeMessage } from "./rpc.js";

const enum LoggerLevel {
  /**
   * An error message.
   */
  Error = 1,
  /**
   * A warning message.
   */
  Warning = 2,
  /**
   * An information message.
   */
  Info = 3,
  /**
   * A log message.
   */
  Log = 4,
  /**
   * A debug message.
   *
   * @since 3.18.0
   * @proposed
   */
  Debug = 5,
}

export interface Logger {
  error(message: string): void;
  warn(message: string): void;
  info(message: string): void;
  log(message: string): void;
  debug(message: string): void;
}

export function createLogger(outputStream: Writable): Logger {
  function log(level: LoggerLevel, message: string) {
    const response = {
      method: "window/logMessage",
      params: {
        type: level.valueOf(),
        message: JSON.stringify(message),
      },
    };

    const str = JSON.stringify(response);

    writeMessage(outputStream, str);
  }

  function createLog(level: LoggerLevel) {
    return (message: string) => log(level, message);
  }

  const logger: Logger = {
    error: createLog(LoggerLevel.Error),
    warn: createLog(LoggerLevel.Warning),
    info: createLog(LoggerLevel.Info),
    log: createLog(LoggerLevel.Log),
    debug: createLog(LoggerLevel.Debug),
  };

  return logger;
}
