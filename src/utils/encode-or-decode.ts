import { QueryValue } from "../@types";

export const encodeValue = (value: QueryValue): string => {
  if (Array.isArray(value)) {
    return encodeURIComponent(value.join(","));
  }

  const decoded = decodeURIComponent(String(value));
  return encodeURIComponent(decoded);
};

export const decodeValue = (value: string): string | string[] => {
  const decoded = decodeURIComponent(value);
  return decoded.includes(",") ? decoded.split(",") : decoded;
};
