import { NextRequest, NextResponse } from "next/server";
import { render } from "@react-email/render";
import { InvitationEmail } from "@/emails/invitation-email";
import { EmailOTPEmail } from "@/emails/email-otp";
import { MagicLinkEmail } from "@/emails/magic-link";
import { PasswordResetEmail } from "@/emails/password-reset";
import { EmailVerificationEmail } from "@/emails/email-verification";
import { TwoFactorOTPEmail } from "@/emails/two-factor-otp";

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Email preview is only available in development mode" },
      { status: 403 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const template = searchParams.get("template") || "invitation";

  let html: string;

  try {
    switch (template) {
      case "invitation":
        html = await render(
          InvitationEmail({
            organizationName: searchParams.get("organizationName") || "Acme Corp",
            inviterName: searchParams.get("inviterName") || "John Doe",
            role: searchParams.get("role") || "admin",
            inviteLink: searchParams.get("inviteLink") || "https://example.com/accept-invite?token=abc123",
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          })
        );
        break;

      case "email-otp":
        html = await render(
          EmailOTPEmail({
            otp: searchParams.get("otp") || "123456",
            type: (searchParams.get("type") as "sign-in" | "sign-up") || "sign-in",
            expiresInMinutes: parseInt(searchParams.get("expiresInMinutes") || "10", 10),
          })
        );
        break;

      case "magic-link":
        html = await render(
          MagicLinkEmail({
            magicLink: searchParams.get("magicLink") || "https://example.com/magic-link?token=xyz789",
            expiresInMinutes: parseInt(searchParams.get("expiresInMinutes") || "10", 10),
          })
        );
        break;

      case "password-reset":
        html = await render(
          PasswordResetEmail({
            resetLink: searchParams.get("resetLink") || "https://example.com/reset-password?token=def456",
            userName: searchParams.get("userName") || undefined,
            expiresInMinutes: parseInt(searchParams.get("expiresInMinutes") || "30", 10),
          })
        );
        break;

      case "email-verification":
        html = await render(
          EmailVerificationEmail({
            verificationLink: searchParams.get("verificationLink") || "https://example.com/verify-email?token=ghi789",
            userName: searchParams.get("userName") || undefined,
          })
        );
        break;

      case "two-factor-otp":
        html = await render(
          TwoFactorOTPEmail({
            otp: searchParams.get("otp") || "654321",
            userName: searchParams.get("userName") || undefined,
            expiresInMinutes: parseInt(searchParams.get("expiresInMinutes") || "5", 10),
          })
        );
        break;

      default:
        return NextResponse.json(
          {
            error: `Unknown template: ${template}`,
            available: [
              "invitation",
              "email-otp",
              "magic-link",
              "password-reset",
              "email-verification",
              "two-factor-otp",
            ],
          },
          { status: 400 }
        );
    }

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to render email template",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
