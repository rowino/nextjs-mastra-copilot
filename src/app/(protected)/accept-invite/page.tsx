"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, Mail } from "lucide-react";
import { routes, getRoute } from "@/lib/routes";

function AcceptInviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [organizationName, setOrganizationName] = useState<string>("");

  const handleAcceptInvitation = async () => {
    if (!token) {
      setError("Invalid invitation link");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(getRoute(routes.api.invitations.accept), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = (await response.json()) as {
        error?: string;
        organization: { id: string; name: string };
      };

      if (!response.ok) {
        throw new Error(data.error || "Failed to accept invitation");
      }

      setOrganizationName(data.organization.name);
      setSuccess(true);

      // Redirect to organization settings after 2 seconds
      setTimeout(() => {
        router.push(getRoute(routes.organization.settings, { orgId: data.organization.id }));
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept invitation");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-theme-bg-base">
        <div className="w-full max-w-md p-8 bg-theme-bg-elevated border border-theme-border-base rounded-lg">
          <div className="flex flex-col items-center text-center space-y-4">
            <XCircle className="size-12 text-theme-error" />
            <h1 className="text-2xl font-semibold text-theme-foreground">
              Invalid Invitation
            </h1>
            <p className="text-theme-secondary">
              This invitation link is invalid or incomplete.
            </p>
            <Button
              onClick={() => router.push(getRoute(routes.settings))}
              className="mt-4 bg-theme-primary text-theme-inverted hover:bg-theme-primary/90"
            >
              Go to Settings
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-theme-bg-base">
        <div className="w-full max-w-md p-8 bg-theme-bg-elevated border border-theme-border-base rounded-lg">
          <div className="flex flex-col items-center text-center space-y-4">
            <CheckCircle2 className="size-12 text-theme-foreground" />
            <h1 className="text-2xl font-semibold text-theme-foreground">
              Welcome to {organizationName}!
            </h1>
            <p className="text-theme-secondary">
              You&apos;ve successfully joined the organization. Redirecting you now...
            </p>
            <Loader2 className="size-6 animate-spin text-theme-foreground mt-4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-theme-bg-base">
      <div className="w-full max-w-md p-8 bg-theme-bg-elevated border border-theme-border-base rounded-lg">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="p-4 bg-theme-bg-card rounded-full">
            <Mail className="size-12 text-theme-foreground" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-theme-foreground">
              Organization Invitation
            </h1>
            <p className="text-theme-secondary">
              You&apos;ve been invited to join an organization. Click the button below to accept the invitation.
            </p>
          </div>

          {error && (
            <div className="w-full p-4 bg-theme-error-bg border border-theme-error rounded-lg">
              <p className="text-theme-error text-sm">{error}</p>
            </div>
          )}

          <Button
            onClick={handleAcceptInvitation}
            disabled={loading}
            className="w-full bg-theme-primary text-theme-inverted hover:bg-theme-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Accepting...
              </>
            ) : (
              "Accept Invitation"
            )}
          </Button>

          <Button
            variant="outline"
            onClick={() => router.push(getRoute(routes.settings))}
            className="w-full border-theme-border-base text-theme-foreground hover:bg-theme-bg-card hover:border-theme-border-hover"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-theme-bg-base">
        <Loader2 className="size-8 animate-spin text-theme-foreground" />
      </div>
    }>
      <AcceptInviteContent />
    </Suspense>
  );
}
