import { URLParamError } from "./error";

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
