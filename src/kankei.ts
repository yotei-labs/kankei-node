import { Email } from "./email/email.js";
import { ErrorResponse, PostOptions } from "./interface.js";

type RequestResponse<T> = Promise<
  { data: T; error: null } | { data: null; error: ErrorResponse }
>;

export class Kankei {
  /**
   * Request headers
   */
  private readonly headers: Headers;

  /**
   * Email API interface
   */
  public readonly email = new Email(this);

  /**
   * Construct the Kankei instance
   *
   * @param secret The application secret key
   */
  public constructor(private readonly secret?: string) {
    if (!secret) {
      if (typeof process !== "undefined" && process.env) {
        this.secret = process.env.KANKEI_SECRET;
      }

      if (!this.secret) {
        throw new Error(
          'Missing application secret! Use `new Kankei("kankei_cFnbdF...")`'
        );
      }
    }

    this.headers = new Headers({
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.secret}`,
    });
  }

  /**
   * Send a post request to Kankei API
   *
   * @param path The resource path
   * @param data The resource values
   * @param options Fetch request options
   * @returns The request data<T> on success, or ErrorResponse on error
   */
  public async post<T>(
    path: string,
    data: unknown,
    options: PostOptions = {}
  ): RequestResponse<T> {
    const headers = new Headers(this.headers);
    const body = JSON.stringify(data);

    return this.request<T>(path, {
      method: "POST",
      headers,
      body,
      ...options,
    });
  }

  /**
   * Send a request to Kankei API
   *
   * @param path The resource path
   * @param options Fetch request options
   * @returns The request data<T> on success, or ErrorResponse on error
   */
  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): RequestResponse<T> {
    try {
      const baseUrl = process.env.KANKEI_URL || "https://kankei.yotei.dev/api";
      const response = await fetch(`${baseUrl}${path}`, options);

      if (!response.ok) {
        try {
          const error = await response.text();
          return { data: null, error: JSON.parse(error) };
        } catch (e) {
          if (e instanceof SyntaxError) {
            return {
              data: null,
              error: {
                name: "server-error",
                message:
                  "Internal server error. Unable to process your request",
              },
            };
          }

          const error: ErrorResponse = {
            message: response.statusText,
            name: "server-error",
          };

          if (e instanceof Error) {
            return { data: null, error: { ...error, message: e.message } };
          }

          return { data: null, error };
        }
      }

      const data = await response.json();

      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: {
          name: "server-error",
          message: "Unable to fetch data. The request could not be resolved",
        },
      };
    }
  }
}
