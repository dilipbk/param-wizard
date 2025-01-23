import { URLSubscriber } from "./subscriber";
import { HistoryState } from "./@types";
import { getSearchParams } from "./base-utils";

export class URLHistory {
  private static instance: URLHistory;
  private initialized = false;

  constructor() {
    if (URLHistory.instance) {
      return URLHistory.instance;
    }
    URLHistory.instance = this;
    this.initialize();
  }

  private initialize(): void {
    if (this.initialized) return;

    window.addEventListener("popstate", (event) => {
      event.preventDefault();

      // Get state from history or current URL
      const state = event.state?.params || {};
      const params = new URLSearchParams(state);

      // Update URL without triggering new history entry
      window.history.replaceState(
        { params: state },
        "",
        `${window.location.pathname}${
          params.toString() ? "?" + params.toString() : ""
        }`
      );

      // Notify subscribers
      URLSubscriber.notify();
    });

    this.initialized = true;
  }

  back(): void {
    window.history.back();
  }

  forward(): void {
    window.history.forward();
  }

  push(state: Partial<HistoryState> = {}): void {
    const params = getSearchParams();
    const currentState = {
      params: Object.fromEntries(params.entries()),
      ...state.data,
    };

    window.history.pushState(
      currentState,
      state.title || document.title,
      state.url || window.location.href
    );
  }
}
