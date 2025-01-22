import { URLSubscriber } from "./subscriber";
import { URLMiddlewareManager } from "./middleware";
import { QueryUpdate } from "./@types";
import { validateInput } from "./validator";
import { encodeValue, decodeValue } from "./utils/encode-or-decode";

export const getSearchParams = (): URLSearchParams =>
  new URLSearchParams(window.location.search);

export const setSearchParams = (params: URLSearchParams): void => {
  const queryString = Array.from(params.entries())
    .map(([key, value]) => {
      return `${encodeURIComponent(key)}=${value}`; // value is already encoded
    })
    .join("&");

  window.history.replaceState(
    { params: Object.fromEntries(params.entries()) },
    "",
    window.location.pathname + (queryString ? "?" + queryString : "")
  );

  // Execute middleware
  const entries = Array.from(params) as [string, string][];
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

export const updateQueryArray = (key: string, values: string[]): void => {
  updateQuery({ key, value: values });
};

export const getParamArray = (key: string): string[] => {
  const value = getSearchParams().get(key);
  if (!value) return [];
  const decoded = decodeValue(value);
  return Array.isArray(decoded) ? decoded : [decoded];
};

export const getParam = (key: string): string | null => {
  return getSearchParams().get(key);
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
