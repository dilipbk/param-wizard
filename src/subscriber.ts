// URL Change Subscriptions

import { URLChangeCallback } from "./@types";
import { getParams } from "./base-utils";

export class URLSubscriber {
  private static subscribers: URLChangeCallback[] = [];

  static subscribe(callback: URLChangeCallback): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter((cb) => cb !== callback);
    };
  }

  static notify(): void {
    const params = getParams();
    this.subscribers.forEach((callback) => callback(params));
  }
}
