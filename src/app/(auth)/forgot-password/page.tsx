"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, ArrowLeft } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthInput } from "@/components/auth/auth-input";
import { Button } from "@/components/ui/button";
import { routes, getRoute } from "@/lib/routes";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    const { error } = await authClient.requestPasswordReset({
      email: data.email,
      redirectTo: routes.auth.resetPassword,
    });

    if (error) {
      setError("root", {
        message: error.message || "Failed to send reset link. Please try again.",
      });
      return;
    }

    setSubmittedEmail(data.email);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <AuthCard
        title="Check your email"
        subtitle="We sent a password reset link"
      >
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-white/10">
            <Mail className="size-8 text-white" />
          </div>
          <p className="mb-6 text-sm text-white/70">
            We sent a password reset link to{" "}
            <span className="font-medium text-white">{submittedEmail}</span>
          </p>
          <Link
            href={getRoute(routes.auth.signIn)}
            className="inline-flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
          >
            <ArrowLeft className="size-4" />
            Back to sign in
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Forgot password"
      subtitle="Enter your email to receive a reset link"
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

        {errors.root && (
          <p className="text-sm text-red-400">{errors.root.message}</p>
        )}

        <Button
          type="submit"
          className="w-full bg-white text-black hover:bg-white/90"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Sending..." : "Send reset link"}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href={getRoute(routes.auth.signIn)}
          className="inline-flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Back to sign in
        </Link>
      </div>
    </AuthCard>
  );
}
