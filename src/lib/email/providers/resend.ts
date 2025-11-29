import { Resend } from "resend";
import { EmailProvider, EmailSendParams, EmailSendParamsSchema } from "./base";

export class ResendProvider implements EmailProvider {
  private resend: Resend;

  constructor() {
    this.validateConfig();
    this.resend = new Resend(process.env.RESEND_API_KEY!);
  }

  validateConfig(): void {
    if (!process.env.RESEND_API_KEY) {
      throw new Error(
        "RESEND_API_KEY is required when EMAIL_PROVIDER=resend. Please set it in your .env file."
      );
    }
  }

  async send(params: EmailSendParams): Promise<void> {
    const validated = EmailSendParamsSchema.parse(params);

    await this.resend.emails.send({
      from: validated.from,
      to: validated.to,
      subject: validated.subject,
      html: validated.html,
    });
  }
}
