export type ValidationRule = {
  required?: boolean;
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
  enum?: string[];
};

export type ValidationRules = Record<string, ValidationRule>;

export interface QueryUpdate {
  key: string;
  value: QueryValue;
}

export type QueryValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | string[];

export interface HistoryState {
  data: Record<string, any>;
  title: string;
  url: string;
}

export type URLChangeCallback = (params: Record<string, string>) => void;
export type URLMiddleware = (
  params: Record<string, string>,
  next: () => void
) => void;
