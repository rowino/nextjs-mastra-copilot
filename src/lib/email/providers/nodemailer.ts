import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { EmailProvider, EmailSendParams, EmailSendParamsSchema } from "./base";

export class NodemailerProvider implements EmailProvider {
  private transporter: Transporter;

  constructor() {
    this.validateConfig();
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST!,
      port: parseInt(process.env.SMTP_PORT!, 10),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PASS!,
      },
    });
  }

  validateConfig(): void {
    const requiredVars = [
      "SMTP_HOST",
      "SMTP_PORT",
      "SMTP_SECURE",
      "SMTP_USER",
      "SMTP_PASS",
    ];

    const missing = requiredVars.filter((varName) => !process.env[varName]);

    if (missing.length > 0) {
      throw new Error(
        `Missing required SMTP environment variables: ${missing.join(", ")}. ` +
          `Please set them in your .env file when EMAIL_PROVIDER=nodemailer.`
      );
    }

    const port = parseInt(process.env.SMTP_PORT!, 10);
    if (isNaN(port) || port <= 0 || port > 65535) {
      throw new Error(
        `Invalid SMTP_PORT: ${process.env.SMTP_PORT}. Must be a number between 1 and 65535.`
      );
    }
  }

  async send(params: EmailSendParams): Promise<void> {
    const validated = EmailSendParamsSchema.parse(params);

    await this.transporter.sendMail({
      from: validated.from,
      to: validated.to,
      subject: validated.subject,
      html: validated.html,
    });
  }
}
