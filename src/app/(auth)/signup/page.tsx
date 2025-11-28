"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { routes, getRoute } from "@/lib/routes";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthInput } from "@/components/auth/auth-input";
import { SocialButtons } from "@/components/auth/social-buttons";
import { Divider } from "@/components/auth/divider";
import { PasswordStrength } from "@/components/auth/password-strength";
import { Button } from "@/components/ui/button";

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z
    .string()
    .min(8, "Min 8 characters")
    .max(128, "Max 128 characters"),
});

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const password = watch("password");

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await authClient.signUp.email({
        name: data.name,
        email: data.email,
        password: data.password,
        callbackURL: getRoute(routes.dashboard),
      });

      if (result.error) {
        setError(result.error.message || "Failed to create account");
        return;
      }

      router.push(getRoute(routes.dashboard));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard
      title="Create account"
      subtitle="Get started with your account"
      footer={
        <p className="text-center text-xs text-white/50">
          By signing up, you agree to our{" "}
          <Link href={getRoute(routes.terms)} className="text-white/70 hover:text-white underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href={getRoute(routes.privacy)} className="text-white/70 hover:text-white underline">
            Privacy Policy
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <AuthInput
          label="Name"
          type="text"
          placeholder="Enter your name"
          autoComplete="name"
          error={errors.name?.message}
          {...register("name")}
        />

        <AuthInput
          label="Email"
          type="email"
          placeholder="Enter your email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />

        <div className="space-y-3">
          <AuthInput
            label="Password"
            type="password"
            placeholder="Create a password"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register("password")}
          />
          {password && <PasswordStrength password={password} />}
        </div>

        {error && (
          <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-white text-black hover:bg-white/90"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>

      <Divider />

      <SocialButtons callbackURL={getRoute(routes.dashboard)} />

      <p className="mt-6 text-center text-sm text-white/70">
        Already have an account?{" "}
        <Link
          href={getRoute(routes.auth.signIn)}
          className="font-medium text-white hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
