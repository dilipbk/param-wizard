interface QueryUpdate {
  key: string;
  value: QueryValue;
}

type QueryValue = string | number | boolean | null | undefined | string[];

interface ValidationRule {
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
  required?: boolean;
  enum?: string[];
}

interface ValidationRules {
  [key: string]: ValidationRule;
}

class URLParamError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "URLParamError";
  }
}

const validateInput = ({ key, value }: QueryUpdate): boolean => {
  if (!key || typeof key !== "string") {
    throw new Error("Key must be a non-empty string");
  }

  if (value !== null && value !== undefined) {
    try {
      String(value);
    } catch (e) {
      throw new Error(`Value for key "${key}" cannot be converted to string`);
    }
  }
  return true;
};

export const encodeValue = (value: QueryValue): string => {
  if (Array.isArray(value)) {
    return encodeURIComponent(value.join(","));
  }
  return encodeURIComponent(String(value));
};

export const decodeValue = (value: string): string | string[] => {
  const decoded = decodeURIComponent(value);
  return decoded.includes(",") ? decoded.split(",") : decoded;
};

export const validateParams = (
  params: Record<string, QueryValue>,
  rules: ValidationRules
): boolean => {
  for (const [key, rule] of Object.entries(rules) as [
    string,
    ValidationRule
  ][]) {
    const value = params[key];

    if (rule.required && (value === undefined || value === null)) {
      throw new URLParamError(`Parameter ${key} is required`);
    }

    if (value && typeof value === "string") {
      if (rule.pattern && !rule.pattern.test(value)) {
        throw new URLParamError(
          `Parameter ${key} does not match required pattern`
        );
      }

      if (rule.minLength && value.length < rule.minLength) {
        throw new URLParamError(`Parameter ${key} is too short`);
      }

      if (rule.maxLength && value.length > rule.maxLength) {
        throw new URLParamError(`Parameter ${key} is too long`);
      }

      if (rule.enum && !rule.enum.includes(value)) {
        throw new URLParamError(
          `Parameter ${key} must be one of: ${rule.enum.join(", ")}`
        );
      }
    }
  }
  return true;
};

export const getSearchParams = (): URLSearchParams =>
  new URLSearchParams(window.location.search);

export const setSearchParams = (params: URLSearchParams): void => {
  const newUrl = `${window.location.pathname}${
    params.toString() ? "?" + params.toString() : ""
  }`;
  window.history.pushState({}, "", newUrl);

  // Execute middleware
  const entries = Array.from(params as URLSearchParams) as [string, string][];
  URLMiddlewareManager.execute(Object.fromEntries(entries));

  // Notify subscribers
  URLSubscriber.notify();
};

export const updateQuery = ({ key, value }: QueryUpdate): void => {
  validateInput({ key, value });
  const newParams = getSearchParams();
  if (value !== null && value !== undefined) {
    newParams.set(key, encodeValue(value));
  } else {
    newParams.delete(key);
  }
  setSearchParams(newParams);
};

export const updateQueries = (updates: QueryUpdate[]): void => {
  if (!Array.isArray(updates)) {
    throw new Error("updateQueries expects an array of updates");
  }

  const newParams = getSearchParams();
  updates.forEach((update) => {
    validateInput(update);
    const { key, value } = update;
    if (value !== null && value !== undefined) {
      newParams.set(key, encodeValue(value));
    } else {
      newParams.delete(key);
    }
  });
  setSearchParams(newParams);
};

export const updateQueryString = (query: string = ""): void => {
  const newParams = getSearchParams();
  const newQuery = new URLSearchParams(query);
  const entries = Array.from(newQuery as URLSearchParams) as [string, string][];
  const key_value_query = Object.fromEntries(entries);

  Object.keys(key_value_query)?.forEach((key) => {
    if (key_value_query[key] !== null && key_value_query[key] !== undefined) {
      newParams.set(key, key_value_query[key]);
    } else {
      newParams.delete(key);
    }
  });

  setSearchParams(newParams);
};

export const clearQuery = (keys: string | string[]): void => {
  if (!Array.isArray(keys)) {
    keys = [keys];
  }

  const newParams = getSearchParams();
  keys.forEach((key) => {
    if (typeof key !== "string") {
      throw new Error("Keys must be strings");
    }
    newParams.delete(key);
  });
  setSearchParams(newParams);
};

export const clearAllQuery = (): void => {
  setSearchParams(new URLSearchParams());
};

export const getParams = (): Record<string, string> => {
  const params = getSearchParams();
  const entries = Array.from(params as URLSearchParams) as [string, string][];
  return Object.fromEntries(entries);
};

export const getParamString = (): string => getSearchParams().toString();

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

export const updateQueryArray = (key: string, values: string[]): void => {
  updateQuery({ key, value: values });
};

export const getParamArray = (key: string): string[] => {
  const value = getSearchParams().get(key);
  if (!value) return [];
  const decoded = decodeValue(value);
  if (!Array.isArray(decoded)) return [decoded];
  return decoded as string[];
};

// Type-safe parameter getter
export function getTypedParam<T>(key: string, defaultValue: T): T {
  const value = getSearchParams().get(key);
  if (value === null) return defaultValue;

  try {
    if (typeof defaultValue === "number") return Number(value) as T;
    if (typeof defaultValue === "boolean") return (value === "true") as T;
    return value as T;
  } catch {
    return defaultValue;
  }
}

// URL History Management
interface HistoryState {
  data: Record<string, any>;
  title: string;
  url: string;
}

export class URLHistory {
  private stack: HistoryState[] = [];
  private currentIndex = -1;

  push(state: Partial<HistoryState> = {}): void {
    this.stack = this.stack.slice(0, this.currentIndex + 1);
    this.stack.push({
      data: state.data || {},
      title: state.title || document.title,
      url: state.url || window.location.href,
    });
    this.currentIndex++;
  }

  back(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.applyState(this.stack[this.currentIndex]);
    }
  }

  forward(): void {
    if (this.currentIndex < this.stack.length - 1) {
      this.currentIndex++;
      this.applyState(this.stack[this.currentIndex]);
    }
  }

  private applyState(state: HistoryState): void {
    window.history.pushState(state.data, state.title, state.url);
  }
}

// URL Change Subscriptions
type URLChangeCallback = (params: Record<string, string>) => void;

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

// Middleware System
type URLMiddleware = (params: Record<string, string>, next: () => void) => void;

export class URLMiddlewareManager {
  private static middlewares: URLMiddleware[] = [];

  static use(middleware: URLMiddleware): void {
    this.middlewares.push(middleware);
  }

  static execute(params: Record<string, string>): void {
    const executeMiddleware = (index: number): void => {
      if (index < this.middlewares.length) {
        this.middlewares[index](params, () => executeMiddleware(index + 1));
      }
    };
    executeMiddleware(0);
  }
}

// Query Parameter Presets
export class URLPresets {
  private static presets: Record<string, Record<string, string>> = {};

  static save(name: string, params: Record<string, string>): void {
    this.presets[name] = { ...params };
  }

  static apply(name: string): void {
    const preset = this.presets[name];
    if (preset) {
      updateQueries(
        Object.entries(preset).map(([key, value]: [string, any]) => ({
          key,
          value,
        }))
      );
    }
  }

  static remove(name: string): void {
    delete this.presets[name];
  }
}

// Complex Object Serialization
export const serializeObject = (obj: Record<string, any>): string => {
  return btoa(JSON.stringify(obj));
};

export const deserializeObject = <T>(str: string): T => {
  try {
    return JSON.parse(atob(str));
  } catch {
    throw new URLParamError("Invalid serialized object");
  }
};
