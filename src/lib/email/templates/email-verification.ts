import { z } from "zod";
import { sendEmail } from "../send";
import { EmailVerificationEmail } from "@/emails/email-verification";

const SendEmailVerificationParamsSchema = z.object({
  to: z.string().email(),
  verificationLink: z.string().url(),
  userName: z.string().optional(),
});

type SendEmailVerificationParams = z.infer<typeof SendEmailVerificationParamsSchema>;

export async function sendEmailVerification(params: SendEmailVerificationParams) {
  const validated = SendEmailVerificationParamsSchema.parse(params);

  await sendEmail({
    to: validated.to,
    subject: "Verify your email address",
    react: EmailVerificationEmail({
      verificationLink: validated.verificationLink,
      userName: validated.userName,
    }),
  });
}
