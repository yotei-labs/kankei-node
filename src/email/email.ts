import { ReactNode } from "react";
import { ErrorResponse, RequireAtLeastOne } from "../interface.js";
import { Kankei } from "../kankei.js";

interface CreateEmailType {
  /**
   * The HTML for the email
   */
  html: string;

  /**
   * The React Email component for the email
   */
  react: ReactNode;
}

interface CreateEmailBaseValues {
  /**
   * Recipient email
   */
  to: string | string[];

  /**
   * Email subject
   */
  subject: string;
}

export type CreateEmailValues = CreateEmailBaseValues &
  RequireAtLeastOne<CreateEmailType>;

export interface CreateEmailResponseSuccess {
  /**
   * Email id
   */
  id: string;
}

export type CreateEmailResponse =
  | { data: CreateEmailResponseSuccess; error: null }
  | { data: null; error: ErrorResponse };

export class Email {
  /**
   * Construct a Email instance
   *
   * @param kankei The Kankei API instance
   */
  constructor(private readonly kankei: Kankei) {}

  /**
   * Generate HTML from ReactNode component using ReactEmail render
   *
   * We need to declare this function because @react-email/render
   * is only needed for the react field in the create() function, so we import it only if necessary.
   *
   * @param node The ReactNode component to render
   */
  private render?: (node: ReactNode) => Promise<string>;

  /**
   * Create and send email
   *
   * @param values The email data
   * @returns The created email
   */
  public async create(values: CreateEmailValues): Promise<CreateEmailResponse> {
    if (values.react) {
      if (!this.render) {
        try {
          const { render } = await import("@react-email/render");
          this.render = render;
        } catch (error) {
          throw new Error(
            "Failed to render React component. Make sure to install '@react-email/render'"
          );
        }
      }

      values.html = await this.render(values.react);
    }

    const data = await this.kankei.post<CreateEmailResponseSuccess>(
      "/email",
      values
    );

    return data;
  }
}
