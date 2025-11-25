"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Loader2, CheckCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { AuthInput } from "./auth-input";

const magicLinkSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type MagicLinkFormData = z.infer<typeof magicLinkSchema>;

interface MagicLinkFormProps {
  callbackURL?: string;
}

export function MagicLinkForm({ callbackURL = "/" }: MagicLinkFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MagicLinkFormData>({
    resolver: zodResolver(magicLinkSchema),
  });

  const onSubmit = async (data: MagicLinkFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await authClient.signIn.magicLink({
        email: data.email,
        callbackURL,
      });

      if (result?.error) {
        throw new Error(result.error.message || "Failed to send magic link");
      }

      setIsSuccess(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      console.error("Magic link error:", err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center space-y-4 py-4">
        <div className="rounded-full bg-green-500/20 p-3">
          <CheckCircle className="size-8 text-green-400" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-lg font-medium text-white">
            Check your email
          </p>
          <p className="text-sm text-white/70">
            We sent you a magic link to sign in
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <AuthInput
        label="Email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />

      {error && (
        <p className="text-sm text-red-400 text-center">{error}</p>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="size-4 mr-2 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Mail className="size-4 mr-2" />
            Send Magic Link
          </>
        )}
      </Button>
    </form>
  );
}
