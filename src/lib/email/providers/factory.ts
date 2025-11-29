import { EmailProvider, EmailSendParams } from "./base";
import { ResendProvider } from "./resend";
import { NodemailerProvider } from "./nodemailer";

class ConsoleEmailProvider implements EmailProvider {
  validateConfig(): void {}

  async send(params: EmailSendParams): Promise<void> {
    console.log(`[Email - Development] Email to ${params.to}`);
    console.log(`Subject: ${params.subject}`);
    console.log(`From: ${params.from}`);
    console.log(`HTML Preview: ${params.html.substring(0, 200)}...`);
  }
}

let providerInstance: EmailProvider | null = null;

export function getEmailProvider(): EmailProvider {
  if (providerInstance) {
    return providerInstance;
  }

  if (process.env.NODE_ENV === "development" && !process.env.EMAIL_PROVIDER) {
    providerInstance = new ConsoleEmailProvider();
    return providerInstance;
  }

  const providerType = process.env.EMAIL_PROVIDER || "resend";

  switch (providerType.toLowerCase()) {
    case "resend":
      providerInstance = new ResendProvider();
      break;
    case "nodemailer":
      providerInstance = new NodemailerProvider();
      break;
    default:
      throw new Error(
        `Unknown EMAIL_PROVIDER: "${providerType}". Supported values: "resend", "nodemailer"`
      );
  }

  return providerInstance;
}
