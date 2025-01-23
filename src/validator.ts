import {
  QueryUpdate,
  QueryValue,
  ValidationRule,
  ValidationRules,
} from "./@types";
import { URLParamError } from "./error";

export const validateInput = ({ key, value }: QueryUpdate): boolean => {
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
