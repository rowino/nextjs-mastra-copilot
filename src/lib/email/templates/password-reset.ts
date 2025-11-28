import { z } from "zod";
import { sendEmail } from "../send";
import { PasswordResetEmail } from "@/emails/password-reset";

const SendPasswordResetParamsSchema = z.object({
  to: z.string().email(),
  resetLink: z.string().url(),
  userName: z.string().optional(),
  expiresInMinutes: z.number().positive().optional().default(30),
});

type SendPasswordResetParams = z.infer<typeof SendPasswordResetParamsSchema>;

export async function sendPasswordReset(params: SendPasswordResetParams) {
  const validated = SendPasswordResetParamsSchema.parse(params);

  await sendEmail({
    to: validated.to,
    subject: "Reset your password",
    react: PasswordResetEmail({
      resetLink: validated.resetLink,
      userName: validated.userName,
      expiresInMinutes: validated.expiresInMinutes,
    }),
  });
}
