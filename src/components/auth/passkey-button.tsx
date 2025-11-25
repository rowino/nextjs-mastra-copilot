"use client";

import { useState } from "react";
import { Fingerprint, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

interface PasskeyButtonProps {
  mode: "signin" | "register";
  name?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function PasskeyButton({
  mode,
  name,
  onSuccess,
  onError,
}: PasskeyButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);

    try {
      if (mode === "signin") {
        const result = await authClient.signIn.passkey();
        if (result?.error) {
          throw new Error(result.error.message || "Passkey sign-in failed");
        }
      } else {
        const result = await authClient.passkey.addPasskey({
          name: name || "My Passkey",
        });
        if (result?.error) {
          throw new Error(result.error.message || "Failed to add passkey");
        }
      }
      onSuccess?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error("An error occurred");
      console.error(`Passkey ${mode} error:`, error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full bg-white/5 hover:bg-white/10 border-white/10 text-white"
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Fingerprint className="size-4" />
      )}
      {mode === "signin" ? "Sign in with Passkey" : "Add Passkey"}
    </Button>
  );
}
