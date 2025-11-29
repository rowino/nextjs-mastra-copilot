"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Fingerprint, Mail } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { authConfig } from "@/lib/auth-config";
import { routes, getRoute } from "@/lib/routes";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthInput } from "@/components/auth/auth-input";
import { SocialButtons } from "@/components/auth/social-buttons";
import { Divider } from "@/components/auth/divider";
import { OTPInput } from "@/components/auth/otp-input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password required"),
  rememberMe: z.boolean().optional(),
});

type SignInFormData = z.infer<typeof signInSchema>;

function SignInContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const returnUrl = searchParams.get("returnUrl") || getRoute(routes.dashboard);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [show2FADialog, setShow2FADialog] = useState(
    searchParams.get("2fa") === "true"
  );
  const [otpCode, setOtpCode] = useState("");
  const [isVerifying2FA, setIsVerifying2FA] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [trustDevice, setTrustDevice] = useState(false);
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null);
  const [isMagicLinkLoading, setIsMagicLinkLoading] = useState(false);
  const [isPasskeyLoading, setIsPasskeyLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const result = await authClient.signIn.email(
        {
          email: data.email,
          password: data.password,
          rememberMe: data.rememberMe,
        },
        {
          onSuccess: (context) => {
            if ("twoFactorRedirect" in context.data && context.data.twoFactorRedirect) {
              setShow2FADialog(true);
              setIsLoading(false);
              return;
            }
            router.push(returnUrl);
          },
          onError: (ctx) => {
            setAuthError(ctx.error.message || "Failed to sign in");
            setIsLoading(false);
          },
        }
      );

      if (result.error && !("twoFactorRedirect" in result)) {
        setAuthError(result.error.message || "Failed to sign in");
      }
    } catch {
      setAuthError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FAVerify = async () => {
    if (otpCode.length < 6 && !useBackupCode) return;

    setIsVerifying2FA(true);
    setTwoFactorError(null);

    try {
      let result;

      if (useBackupCode) {
        result = await authClient.twoFactor.verifyBackupCode({
          code: otpCode,
        });
      } else {
        result = await authClient.twoFactor.verifyTotp({
          code: otpCode,
          trustDevice,
        });
      }

      if (result.error) {
        setTwoFactorError(result.error.message || "Invalid code");
        return;
      }

      router.push(returnUrl);
    } catch {
      setTwoFactorError("Failed to verify code");
    } finally {
      setIsVerifying2FA(false);
    }
  };

  const handleMagicLink = async () => {
    const email = getValues("email");
    if (!email) {
      setAuthError("Please enter your email address");
      return;
    }

    setIsMagicLinkLoading(true);
    setAuthError(null);

    try {
      const result = await authClient.signIn.magicLink({
        email,
        callbackURL: returnUrl,
      });

      if (result.error) {
        setAuthError(result.error.message || "Failed to send magic link");
        return;
      }

      setAuthError(null);
      alert("Check your email for the magic link!");
    } catch {
      setAuthError("Failed to send magic link");
    } finally {
      setIsMagicLinkLoading(false);
    }
  };

  const handlePasskey = async () => {
    setIsPasskeyLoading(true);
    setAuthError(null);

    try {
      const result = await authClient.signIn.passkey();

      if (result?.error) {
        setAuthError(result.error.message || "Passkey authentication failed");
        return;
      }

      router.push(returnUrl);
    } catch {
      setAuthError("Passkey authentication failed");
    } finally {
      setIsPasskeyLoading(false);
    }
  };

  return (
    <>
      <AuthCard
        title="Welcome back"
        subtitle="Sign in to your account to continue"
        footer={
          <p className="text-center text-sm text-white/60">
            Don&apos;t have an account?{" "}
            <Link
              href={searchParams.get("returnUrl") ? `${getRoute(routes.auth.signUp)}?returnUrl=${encodeURIComponent(searchParams.get("returnUrl")!)}` : getRoute(routes.auth.signUp)}
              className="text-white hover:text-white/80 underline underline-offset-4"
            >
              Sign up
            </Link>
          </p>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <AuthInput
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />

          <AuthInput
            label="Password"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password")}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                {...register("rememberMe")}
                className="border-white/20 data-[state=checked]:bg-white data-[state=checked]:text-indigo-950"
              />
              <Label
                htmlFor="rememberMe"
                className="text-sm text-white/70 cursor-pointer"
              >
                Remember me
              </Label>
            </div>
            <Link
              href={getRoute(routes.auth.forgotPassword)}
              className="text-sm text-white/70 hover:text-white underline-offset-4 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          {authError && (
            <p className="text-sm text-red-400 text-center">{authError}</p>
          )}

          <Button
            type="submit"
            className="w-full bg-white text-indigo-950 hover:bg-white/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        <Divider />

        <SocialButtons callbackURL={returnUrl} />

        {(authConfig.magicLink || authConfig.passkey) && (
          <div className="mt-4 space-y-3">
            {authConfig.magicLink && (
              <Button
                type="button"
                variant="outline"
                className="w-full bg-white/5 hover:bg-white/10 border-white/10 text-white"
                onClick={handleMagicLink}
                disabled={isMagicLinkLoading}
              >
                {isMagicLinkLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Mail className="size-4" />
                )}
                Sign in with Magic Link
              </Button>
            )}

            {authConfig.passkey && (
              <Button
                type="button"
                variant="outline"
                className="w-full bg-white/5 hover:bg-white/10 border-white/10 text-white"
                onClick={handlePasskey}
                disabled={isPasskeyLoading}
              >
                {isPasskeyLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Fingerprint className="size-4" />
                )}
                Sign in with Passkey
              </Button>
            )}
          </div>
        )}
      </AuthCard>

      <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
        <DialogContent className="bg-slate-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Two-Factor Authentication</DialogTitle>
            <DialogDescription className="text-white/60">
              {useBackupCode
                ? "Enter one of your backup codes"
                : "Enter the 6-digit code from your authenticator app"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {useBackupCode ? (
              <AuthInput
                label="Backup Code"
                type="text"
                placeholder="Enter backup code"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
              />
            ) : (
              <OTPInput
                value={otpCode}
                onChange={setOtpCode}
                disabled={isVerifying2FA}
              />
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="trustDevice"
                checked={trustDevice}
                onCheckedChange={(checked) => setTrustDevice(checked === true)}
                className="border-white/20 data-[state=checked]:bg-white data-[state=checked]:text-indigo-950"
              />
              <Label
                htmlFor="trustDevice"
                className="text-sm text-white/70 cursor-pointer"
              >
                Trust this device for 30 days
              </Label>
            </div>

            {twoFactorError && (
              <p className="text-sm text-red-400 text-center">
                {twoFactorError}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={handle2FAVerify}
              className="w-full bg-white text-indigo-950 hover:bg-white/90"
              disabled={isVerifying2FA || (otpCode.length < 6 && !useBackupCode)}
            >
              {isVerifying2FA ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify"
              )}
            </Button>

            <button
              type="button"
              onClick={() => {
                setUseBackupCode(!useBackupCode);
                setOtpCode("");
                setTwoFactorError(null);
              }}
              className="text-sm text-white/60 hover:text-white underline-offset-4 hover:underline"
            >
              {useBackupCode
                ? "Use authenticator app instead"
                : "Use backup code instead"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <AuthCard title="Welcome back" subtitle="Loading...">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-8 text-white animate-spin" />
        </div>
      </AuthCard>
    }>
      <SignInContent />
    </Suspense>
  );
}
