import { render } from "@react-email/render";
import { getEmailProvider } from "./providers/factory";
import type { ReactElement } from "react";
import { z } from "zod";

const SendEmailParamsSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1),
  react: z.custom<ReactElement>((val) => val !== null && typeof val === "object"),
});

type SendEmailParams = z.infer<typeof SendEmailParamsSchema>;

export async function sendEmail({ to, subject, react }: SendEmailParams) {
  const validated = SendEmailParamsSchema.parse({ to, subject, react });

  const html = await render(validated.react);
  const from = process.env.EMAIL_FROM || "noreply@example.com";

  const provider = getEmailProvider();

  await provider.send({
    from,
    to: validated.to,
    subject: validated.subject,
    html,
  });
}
