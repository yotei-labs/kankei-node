import { ErrorResponse, RequireAtLeastOne } from "../interface";
import { Kankei } from "../kankei";

interface CreateEmailType {
  /**
   * The HTML of the email
   */
  html: string;
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
   * Create and send email
   *
   * @param values The email data
   * @returns The created email
   */
  public async create(values: CreateEmailValues): Promise<CreateEmailResponse> {
    const data = await this.kankei.post<CreateEmailResponseSuccess>(
      "/email",
      values
    );

    return data;
  }
}
