import { QueryUpdate } from "./@types";
import { getSearchParams, setSearchParams } from "./base-utils";
import { validateInput } from "./validator";
import { encodeValue } from "./utils/encode-or-decode";

export class URLTransaction {
  private params: URLSearchParams;

  constructor() {
    this.params = getSearchParams();
  }

  update({ key, value }: QueryUpdate): this {
    validateInput({ key, value });
    if (value !== null && value !== undefined) {
      this.params.set(key, encodeValue(value));
    } else {
      this.delete(key);
    }
    return this;
  }

  updates(updates: QueryUpdate[]): this {
    updates.forEach((update) => this.update(update));
    return this;
  }

  delete(key: string): this {
    this.params.delete(key);
    return this;
  }

  clear(keys: string | string[]): this {
    const keyArray = Array.isArray(keys) ? keys : [keys];
    keyArray.forEach((key) => this.delete(key));
    return this;
  }

  clearAll(): this {
    this.params = new URLSearchParams();
    return this;
  }

  commit(): void {
    setSearchParams(this.params);
  }
}
