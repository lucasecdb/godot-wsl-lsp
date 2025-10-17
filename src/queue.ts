import { Logger } from "./logger.js";

export class Queue<T extends object> {
  private queue: Array<Promise<T>> = [];

  private currentItem: Promise<T> | null = null;

  constructor(
    private processor: (value: T) => Promise<void>,
    private logger: Logger,
  ) {}

  public enqueue(value: T | Promise<T>) {
    this.queue.push("then" in value ? value : Promise.resolve(value));

    if (this.currentItem == null) {
      this.processNextItem();
    }
  }

  private processNextItem() {
    if (this.currentItem != null) {
      return;
    }

    this.currentItem = this.queue.splice(0, 1)[0];

    this.currentItem
      .then((item) => this.processor(item as T))
      .then(() => {
        this.currentItem = null;

        if (this.queue.length > 0) {
          this.processNextItem();
        }
      })
      .catch((err) => {
        this.logger.error("Error when processing queue item " + err);
      });
  }
}
