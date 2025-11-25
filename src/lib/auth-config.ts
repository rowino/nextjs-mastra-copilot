export const authConfig = {
  emailPassword: process.env.NEXT_PUBLIC_ENABLE_EMAIL_PASSWORD === "true",
  emailOTP: process.env.NEXT_PUBLIC_ENABLE_EMAIL_OTP === "true",
  magicLink: process.env.NEXT_PUBLIC_ENABLE_MAGIC_LINK === "true",
  twoFactor: process.env.NEXT_PUBLIC_ENABLE_2FA === "true",
  passkey: process.env.NEXT_PUBLIC_ENABLE_PASSKEY === "true",
} as const;

export type AuthConfig = typeof authConfig;
