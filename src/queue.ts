export class Queue<T> {
  private queue: Array<T> = [];

  private currentItem: T | null = null;

  constructor(private processor: (value: T) => Promise<void>) {}

  public enqueue(value: T) {
    this.queue.push(value);

    if (this.currentItem == null) {
      this.processNextItem();
    }
  }

  private processNextItem() {
    if (this.currentItem != null) {
      return;
    }

    this.currentItem = this.queue.splice(0, 1)[0];

    this.processor(this.currentItem).then(() => {
      this.currentItem = null;

      if (this.queue.length > 0) {
        this.processNextItem();
      }
    });
  }
}
