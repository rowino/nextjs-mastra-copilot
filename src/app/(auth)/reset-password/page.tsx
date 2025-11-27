"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, AlertTriangle, ArrowLeft, Loader2 } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthInput } from "@/components/auth/auth-input";
import { PasswordStrength } from "@/components/auth/password-strength";
import { Button } from "@/components/ui/button";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must be less than 128 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const password = watch("password", "");

  useEffect(() => {
    if (!token) {
      setTokenError("Invalid or missing reset token. Please request a new password reset link.");
    }
  }, [token]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setTokenError("Invalid or missing reset token.");
      return;
    }

    const { error } = await authClient.resetPassword({
      newPassword: data.password,
      token,
    });

    if (error) {
      if (error.message?.toLowerCase().includes("expired") || error.message?.toLowerCase().includes("invalid")) {
        setTokenError(error.message || "Reset link has expired or is invalid.");
      } else {
        setError("root", {
          message: error.message || "Failed to reset password. Please try again.",
        });
      }
      return;
    }

    setIsSuccess(true);
  };

  if (tokenError) {
    return (
      <AuthCard
        title="Reset link invalid"
        subtitle="Unable to reset your password"
      >
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-red-500/10">
            <AlertTriangle className="size-8 text-red-400" />
          </div>
          <p className="mb-6 text-sm text-white/70">{tokenError}</p>
          <Link
            href="/forgot-password"
            className="inline-flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
          >
            <ArrowLeft className="size-4" />
            Request a new reset link
          </Link>
        </div>
      </AuthCard>
    );
  }

  if (isSuccess) {
    return (
      <AuthCard
        title="Password reset successfully"
        subtitle="You can now sign in with your new password"
      >
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-500/10">
            <CheckCircle2 className="size-8 text-green-500" />
          </div>
          <p className="mb-6 text-sm text-white/70">
            Your password has been reset successfully.
          </p>
          <Button
            asChild
            className="w-full bg-white text-black hover:bg-white/90"
          >
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Reset password"
      subtitle="Enter your new password"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-4">
          <AuthInput
            label="New password"
            type="password"
            placeholder="Enter your new password"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register("password")}
          />

          {password && (
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <PasswordStrength password={password} />
            </div>
          )}
        </div>

        <AuthInput
          label="Confirm password"
          type="password"
          placeholder="Confirm your new password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        {errors.root && (
          <p className="text-sm text-red-400">{errors.root.message}</p>
        )}

        <Button
          type="submit"
          className="w-full bg-white text-black hover:bg-white/90"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Resetting..." : "Reset password"}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/sign-in"
          className="inline-flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Back to sign in
        </Link>
      </div>
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <AuthCard title="Reset password" subtitle="Loading...">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-8 text-white animate-spin" />
        </div>
      </AuthCard>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
