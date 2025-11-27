"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2, Mail } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { AuthCard } from "@/components/auth/auth-card";
import { OTPInput } from "@/components/auth/otp-input";
import { Button } from "@/components/ui/button";

type VerificationStatus = "loading" | "success" | "error" | "otp";

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<VerificationStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [otpCode, setOtpCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const verifyToken = useCallback(async (verificationToken: string) => {
    try {
      const result = await authClient.verifyEmail({
        query: { token: verificationToken },
      });

      if (result.error) {
        setStatus("error");
        setErrorMessage(result.error.message || "Verification failed");
        return;
      }

      setStatus("success");
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch {
      setStatus("error");
      setErrorMessage("An unexpected error occurred during verification");
    }
  }, [router]);

  useEffect(() => {
    if (token) {
      verifyToken(token);
    } else if (email) {
      setStatus("otp");
    } else {
      setStatus("error");
      setErrorMessage("No verification token or email provided");
    }
  }, [token, email, verifyToken]);

  const handleOTPSubmit = async () => {
    if (otpCode.length < 6 || !email) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const result = await authClient.emailOtp.verifyEmail({
        email,
        otp: otpCode,
      });

      if (result.error) {
        setErrorMessage(result.error.message || "Invalid verification code");
        setIsSubmitting(false);
        return;
      }

      setStatus("success");
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch {
      setErrorMessage("Failed to verify code");
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <AuthCard title="Verifying" subtitle="Please wait while we verify your email">
        <div className="flex flex-col items-center py-8">
          <Loader2 className="size-12 text-white animate-spin" />
          <p className="mt-4 text-white/70">Verifying...</p>
        </div>
      </AuthCard>
    );
  }

  if (status === "success") {
    return (
      <AuthCard title="Email Verified" subtitle="Your email has been successfully verified">
        <div className="flex flex-col items-center py-8">
          <CheckCircle2 className="size-12 text-green-400" />
          <p className="mt-4 text-white/70">Redirecting to dashboard...</p>
        </div>
        <Button
          onClick={() => router.push("/dashboard")}
          className="w-full bg-white text-indigo-950 hover:bg-white/90"
        >
          Continue to Dashboard
        </Button>
      </AuthCard>
    );
  }

  if (status === "error") {
    return (
      <AuthCard
        title="Verification Failed"
        subtitle="We couldn't verify your email"
        footer={
          <p className="text-center text-sm text-white/60">
            <Link
              href="/signin"
              className="text-white hover:text-white/80 underline underline-offset-4"
            >
              Back to sign in
            </Link>
          </p>
        }
      >
        <div className="flex flex-col items-center py-8">
          <XCircle className="size-12 text-red-400" />
          <p className="mt-4 text-white/70 text-center">{errorMessage}</p>
        </div>
        <div className="space-y-3">
          <Button
            onClick={() => router.push("/signup")}
            variant="outline"
            className="w-full bg-white/5 hover:bg-white/10 border-white/10 text-white"
          >
            Try signing up again
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Enter Verification Code"
      subtitle={`We sent a code to ${email}`}
      footer={
        <p className="text-center text-sm text-white/60">
          Didn&apos;t receive the code?{" "}
          <Link
            href="/signin"
            className="text-white hover:text-white/80 underline underline-offset-4"
          >
            Try again
          </Link>
        </p>
      }
    >
      <div className="flex flex-col items-center py-4">
        <div className="size-12 rounded-full bg-white/10 flex items-center justify-center mb-6">
          <Mail className="size-6 text-white" />
        </div>

        <div className="w-full space-y-6">
          <OTPInput
            value={otpCode}
            onChange={setOtpCode}
            disabled={isSubmitting}
          />

          {errorMessage && (
            <p className="text-sm text-red-400 text-center">{errorMessage}</p>
          )}

          <Button
            onClick={handleOTPSubmit}
            className="w-full bg-white text-indigo-950 hover:bg-white/90"
            disabled={isSubmitting || otpCode.length < 6}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify Email"
            )}
          </Button>
        </div>
      </div>
    </AuthCard>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <AuthCard title="Verifying" subtitle="Please wait">
        <div className="flex flex-col items-center py-8">
          <Loader2 className="size-12 text-white animate-spin" />
        </div>
      </AuthCard>
    }>
      <VerifyContent />
    </Suspense>
  );
}
