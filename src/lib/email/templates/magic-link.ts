import { z } from "zod";
import { sendEmail } from "../send";
import { MagicLinkEmail } from "@/emails/magic-link";

const SendMagicLinkParamsSchema = z.object({
  to: z.string().email(),
  magicLink: z.string().url(),
  expiresInMinutes: z.number().positive().optional().default(10),
});

type SendMagicLinkParams = z.infer<typeof SendMagicLinkParamsSchema>;

export async function sendMagicLink(params: SendMagicLinkParams) {
  const validated = SendMagicLinkParamsSchema.parse(params);

  await sendEmail({
    to: validated.to,
    subject: "Sign in to your account",
    react: MagicLinkEmail({
      magicLink: validated.magicLink,
      expiresInMinutes: validated.expiresInMinutes,
    }),
  });
}
