import { z } from "zod";
import { sendEmail } from "../send";
import { EmailOTPEmail } from "@/emails/email-otp";

const SendEmailOTPParamsSchema = z.object({
  to: z.string().email(),
  otp: z.string().min(1),
  type: z.enum(["sign-in", "sign-up"]),
  expiresInMinutes: z.number().positive().optional().default(10),
});

type SendEmailOTPParams = z.infer<typeof SendEmailOTPParamsSchema>;

export async function sendEmailOTP(params: SendEmailOTPParams) {
  const validated = SendEmailOTPParamsSchema.parse(params);

  const action = validated.type === "sign-in" ? "sign in" : "sign up";

  await sendEmail({
    to: validated.to,
    subject: `Your ${action} code is ${validated.otp}`,
    react: EmailOTPEmail({
      otp: validated.otp,
      type: validated.type,
      expiresInMinutes: validated.expiresInMinutes,
    }),
  });
}
