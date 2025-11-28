import { z } from "zod";

export const EmailSendParamsSchema = z.object({
  from: z.string().email(),
  to: z.string().email(),
  subject: z.string().min(1),
  html: z.string().min(1),
});

export type EmailSendParams = z.infer<typeof EmailSendParamsSchema>;

export interface EmailProvider {
  send(params: EmailSendParams): Promise<void>;
  validateConfig(): void;
}
