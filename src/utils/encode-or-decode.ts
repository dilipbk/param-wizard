import { QueryValue } from "../@types";

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
