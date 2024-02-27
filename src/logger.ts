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

function log(level: LoggerLevel, message: string) {
  const response = {
    method: "window/logMessage",
    params: {
      type: level.valueOf(),
      message,
    },
  };

  const str = JSON.stringify(response);

  process.stdout.write(`Content-Length: ${str.length}\r\n\r\n${str}`);
}

function createLog(level: LoggerLevel) {
  return (message: string) => log(level, message);
}

export const logger = {
  error: createLog(LoggerLevel.Error),
  warn: createLog(LoggerLevel.Warning),
  info: createLog(LoggerLevel.Info),
  log: createLog(LoggerLevel.Log),
  debug: createLog(LoggerLevel.Debug),
};
