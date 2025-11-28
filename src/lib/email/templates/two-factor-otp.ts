import { z } from "zod";
import { sendEmail } from "../send";
import { TwoFactorOTPEmail } from "@/emails/two-factor-otp";

const SendTwoFactorOTPParamsSchema = z.object({
  to: z.string().email(),
  otp: z.string().min(1),
  userName: z.string().optional(),
  expiresInMinutes: z.number().positive().optional().default(5),
});

type SendTwoFactorOTPParams = z.infer<typeof SendTwoFactorOTPParamsSchema>;

export async function sendTwoFactorOTP(params: SendTwoFactorOTPParams) {
  const validated = SendTwoFactorOTPParamsSchema.parse(params);

  await sendEmail({
    to: validated.to,
    subject: `Your two-factor authentication code is ${validated.otp}`,
    react: TwoFactorOTPEmail({
      otp: validated.otp,
      userName: validated.userName,
      expiresInMinutes: validated.expiresInMinutes,
    }),
  });
}
