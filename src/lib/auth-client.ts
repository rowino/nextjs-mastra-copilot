import { createAuthClient } from "better-auth/react";
import { emailOTPClient, magicLinkClient, twoFactorClient } from "better-auth/client/plugins";
import { passkeyClient } from "@better-auth/passkey/client";

const plugins = [];

if (process.env.NEXT_PUBLIC_ENABLE_EMAIL_OTP === "true") {
  plugins.push(emailOTPClient());
}

if (process.env.NEXT_PUBLIC_ENABLE_MAGIC_LINK === "true") {
  plugins.push(magicLinkClient());
}

if (process.env.NEXT_PUBLIC_ENABLE_2FA === "true") {
  plugins.push(
    twoFactorClient({
      onTwoFactorRedirect() {
        window.location.href = "/signin?2fa=true";
      },
    })
  );
}

if (process.env.NEXT_PUBLIC_ENABLE_PASSKEY === "true") {
  plugins.push(passkeyClient());
}

export const authClient = createAuthClient({
  plugins,
});
