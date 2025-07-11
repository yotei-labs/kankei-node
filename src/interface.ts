export interface PostOptions {
  query?: { [key: string]: unknown };
}

export const KANKEI_ERRORS = {
  "server-error": 500,
  "validation-error": 422,
} as const;

export type KANKEI_ERROR_KEY = keyof typeof KANKEI_ERRORS;

export interface ErrorResponse {
  name: KANKEI_ERROR_KEY;
  message: string;
}

/**
 * A type where at least one of the properties of an interface (can be any property) is required to exist
 *
 * @see https://learn.microsoft.com/en-us/javascript/api/@azure/keyvault-certificates/requireatleastone?view=azure-node-latest
 */
export type RequireAtLeastOne<T> = {
  [K in keyof T]-?: Required<Pick<T, K>> &
    Partial<Pick<T, Exclude<keyof T, K>>>;
}[keyof T];
