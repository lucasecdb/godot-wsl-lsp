import { Writable } from "node:stream";
import { writeMessage } from "./rpc.js";
import { randomUUID } from "node:crypto";

/**
 * @link {https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#workDoneProgress}
 */
export interface WorkDoneProgressBegin {
  kind: "begin";

  /**
   * Mandatory title of the progress operation. Used to briefly inform about
   * the kind of operation being performed.
   *
   * Examples: "Indexing" or "Linking dependencies".
   */
  title: string;

  /**
   * Controls if a cancel button should show to allow the user to cancel the
   * long running operation. Clients that don't support cancellation are
   * allowed to ignore the setting.
   */
  cancellable?: boolean;

  /**
   * Optional, more detailed associated progress message. Contains
   * complementary information to the `title`.
   *
   * Examples: "3/25 files", "project/src/module2", "node_modules/some_dep".
   * If unset, the previous progress message (if any) is still valid.
   */
  message?: string;

  /**
   * Optional progress percentage to display (value 100 is considered 100%).
   * If not provided infinite progress is assumed and clients are allowed
   * to ignore the `percentage` value in subsequent report notifications.
   *
   * The value should be steadily rising. Clients are free to ignore values
   * that are not following this rule. The value range is [0, 100].
   */
  percentage?: number;
}

/**
 * @link {https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#workDoneProgressReport}
 */
export interface WorkDoneProgressReport {
  kind: "report";

  /**
   * Controls enablement state of a cancel button. This property is only valid
   * if a cancel button got requested in the `WorkDoneProgressBegin` payload.
   *
   * Clients that don't support cancellation or don't support control the
   * button's enablement state are allowed to ignore the setting.
   */
  cancellable?: boolean;

  /**
   * Optional, more detailed associated progress message. Contains
   * complementary information to the `title`.
   *
   * Examples: "3/25 files", "project/src/module2", "node_modules/some_dep".
   * If unset, the previous progress message (if any) is still valid.
   */
  message?: string;

  /**
   * Optional progress percentage to display (value 100 is considered 100%).
   * If not provided infinite progress is assumed and clients are allowed
   * to ignore the `percentage` value in subsequent report notifications.
   *
   * The value should be steadily rising. Clients are free to ignore values
   * that are not following this rule. The value range is [0, 100].
   */
  percentage?: number;
}

/**
 * @link {https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#workDoneProgressEnd}
 */
export interface WorkDoneProgressEnd {
  kind: "end";

  /**
   * Optional, a final message indicating to for example indicate the outcome
   * of the operation.
   */
  message?: string;
}

export class ProgressReporter {
  constructor(private output: Writable) {}

  private sendProgressMessage<T>(token: number | string, value: T) {
    const message = {
      method: "$/progress",
      params: {
        token,
        value,
      },
    };

    const str = JSON.stringify(message);

    writeMessage(this.output, str);
  }

  public workBegin(value: Omit<WorkDoneProgressBegin, "kind">) {
    const token = randomUUID();

    this.sendProgressMessage<WorkDoneProgressBegin>(token, {
      kind: "begin",
      ...value,
    });

    return {
      reportWork: (value: Omit<WorkDoneProgressReport, "kind">) => {
        this.sendProgressMessage<WorkDoneProgressReport>(token, {
          kind: "report",
          ...value,
        });
      },
      workEnd: (value: Omit<WorkDoneProgressEnd, "kind">) => {
        this.sendProgressMessage<WorkDoneProgressEnd>(token, {
          kind: "end",
          ...value,
        });
      },
    };
  }
}
