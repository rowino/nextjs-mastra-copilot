"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, XCircle, Mail, LogIn } from "lucide-react";
import { routes, getRoute } from "@/lib/routes";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { z } from "zod";

const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

function AcceptInviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const emailParam = searchParams.get("email");

  const { data: session, isPending: sessionLoading } = authClient.useSession();

  const [loading, setLoading] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [organizationName, setOrganizationName] = useState<string>("");
  const [inviteDetails, setInviteDetails] = useState<{
    email: string;
    organizationName: string;
    role: string;
    expiresAt: string;
  } | null>(null);

  // Signup form state
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  // Fetch invitation details on mount
  useEffect(() => {
    const fetchInviteDetails = async () => {
      if (!token) {
        setInviteLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${getRoute(routes.api.invitations.lookup)}?token=${encodeURIComponent(token)}`
        );
        const data = await response.json() as {
          error?: string;
          email?: string;
          organizationName?: string;
          role?: string;
          expiresAt?: string;
        };

        if (!response.ok) {
          setError(data.error || "Failed to load invitation details");
          setInviteLoading(false);
          return;
        }

        setInviteDetails(data as { email: string; organizationName: string; role: string; expiresAt: string });
        setInviteLoading(false);
      } catch {
        setError("Failed to load invitation details");
        setInviteLoading(false);
      }
    };

    fetchInviteDetails();
  }, [token]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inviteDetails || !emailParam) {
      toast.error("Invalid invitation");
      return;
    }

    const validation = signupSchema.safeParse({ name, password });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setLoading(true);
    try {
      const result = await authClient.signUp.email({
        email: emailParam,
        password,
        name,
      });

      if (result.error) {
        throw new Error(result.error.message || "Signup failed");
      }

      toast.success("Account created! You can now accept the invitation.");
      // Session will be updated automatically, triggering re-render to show accept button
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create account");
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async () => {
    if (!token) {
      setError("Invalid invitation link");
      return;
    }

    // Validate email matches
    if (session?.user?.email && inviteDetails?.email !== session.user.email) {
      setError(
        `This invitation was sent to ${inviteDetails?.email}, but you are logged in as ${session.user.email}. Please log out and sign in with the correct account.`
      );
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

      // Redirect to settings organizations tab after 2 seconds
      setTimeout(() => {
        router.push(getRoute(routes.settings, { tab: "organizations" }));
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept invitation");
    } finally {
      setLoading(false);
    }
  };

  // Loading state while fetching session or invite details
  if (sessionLoading || inviteLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-theme-bg-base">
        <Loader2 className="size-8 animate-spin text-theme-foreground" />
      </div>
    );
  }

  // Invalid token
  if (!token || error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-theme-bg-base">
        <div className="w-full max-w-md p-8 bg-theme-bg-elevated border border-theme-border-base rounded-lg">
          <div className="flex flex-col items-center text-center space-y-4">
            <XCircle className="size-12 text-theme-error" />
            <h1 className="text-2xl font-semibold text-theme-foreground font-mono uppercase tracking-wider">
              Invalid Invitation
            </h1>
            <p className="text-theme-secondary font-mono">
              {error || "This invitation link is invalid or incomplete."}
            </p>
            <Button
              onClick={() => router.push(getRoute(routes.dashboard))}
              className="mt-4 bg-theme-primary text-theme-inverted hover:bg-theme-primary/90 font-mono uppercase text-xs tracking-wider"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-theme-bg-base">
        <div className="w-full max-w-md p-8 bg-theme-bg-elevated border border-theme-border-base rounded-lg">
          <div className="flex flex-col items-center text-center space-y-4">
            <CheckCircle2 className="size-12 text-theme-foreground" />
            <h1 className="text-2xl font-semibold text-theme-foreground font-mono uppercase tracking-wider">
              Welcome to {organizationName}!
            </h1>
            <p className="text-theme-secondary font-mono">
              You&apos;ve successfully joined the organization. Redirecting you now...
            </p>
            <Loader2 className="size-6 animate-spin text-theme-foreground mt-4" />
          </div>
        </div>
      </div>
    );
  }

  // State 1: Logged in - Show accept button
  if (session?.user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-theme-bg-base">
        <div className="w-full max-w-md p-8 bg-theme-bg-elevated border border-theme-border-base rounded-lg">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="p-4 bg-theme-bg-card rounded-full">
              <Mail className="size-12 text-theme-foreground" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-theme-foreground font-mono uppercase tracking-wider">
                Organization Invitation
              </h1>
              <p className="text-theme-secondary font-mono">
                You&apos;ve been invited to join <strong>{inviteDetails?.organizationName}</strong> as a{" "}
                <strong>{inviteDetails?.role}</strong>.
              </p>
              <p className="text-sm text-theme-muted font-mono">
                Invitation sent to: {inviteDetails?.email}
              </p>
            </div>

            {error && (
              <div className="w-full p-4 bg-theme-error/10 border border-theme-error rounded-lg">
                <p className="text-theme-error text-sm font-mono">{error}</p>
              </div>
            )}

            <Button
              onClick={handleAcceptInvitation}
              disabled={loading}
              className="w-full bg-theme-primary text-theme-inverted hover:bg-theme-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-mono uppercase text-xs tracking-wider"
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
              onClick={() => router.push(getRoute(routes.dashboard))}
              className="w-full border-theme-border-base text-theme-secondary hover:bg-theme-bg-card hover:border-theme-border-hover hover:text-theme-foreground font-mono uppercase text-xs tracking-wider cursor-pointer"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // State 2: Not logged in + email in URL - Show inline signup form
  if (emailParam && inviteDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-theme-bg-base">
        <div className="w-full max-w-md p-8 bg-theme-bg-elevated border border-theme-border-base rounded-lg">
          <div className="flex flex-col space-y-6">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-4 bg-theme-bg-card rounded-full">
                <Mail className="size-12 text-theme-foreground" />
              </div>
              <h1 className="text-2xl font-semibold text-theme-foreground font-mono uppercase tracking-wider">
                Join {inviteDetails.organizationName}
              </h1>
              <p className="text-theme-secondary font-mono">
                Create your account to accept the invitation
              </p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-theme-secondary font-mono uppercase text-xs tracking-wider">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={emailParam}
                  disabled
                  className="bg-theme-bg-base border-theme-border-base text-theme-secondary font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-theme-secondary font-mono uppercase text-xs tracking-wider">
                  Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  required
                  className="bg-theme-bg-elevated border-theme-border-base text-theme-foreground placeholder:text-theme-muted focus:border-theme-primary focus:ring-1 focus:ring-theme-primary font-mono transition-colors duration-150 ease-linear"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-theme-secondary font-mono uppercase text-xs tracking-wider">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  className="bg-theme-bg-elevated border-theme-border-base text-theme-foreground placeholder:text-theme-muted focus:border-theme-primary focus:ring-1 focus:ring-theme-primary font-mono transition-colors duration-150 ease-linear"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-theme-primary text-theme-inverted hover:bg-theme-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-mono uppercase text-xs tracking-wider"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account & Accept Invitation"
                )}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-theme-secondary font-mono">
                Already have an account?{" "}
                <a
                  href={getRoute(routes.auth.signIn, { returnUrl: `/accept-invite?token=${token}` }, true)}
                  className="text-theme-primary hover:underline"
                >
                  Sign in
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // State 3: Not logged in + no email - Show sign-in button
  return (
    <div className="flex items-center justify-center min-h-screen bg-theme-bg-base">
      <div className="w-full max-w-md p-8 bg-theme-bg-elevated border border-theme-border-base rounded-lg">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="p-4 bg-theme-bg-card rounded-full">
            <LogIn className="size-12 text-theme-foreground" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-theme-foreground font-mono uppercase tracking-wider">
              Sign In Required
            </h1>
            <p className="text-theme-secondary font-mono">
              You&apos;ve been invited to join <strong>{inviteDetails?.organizationName}</strong>.
              Please sign in to accept the invitation.
            </p>
          </div>

          <Button
            onClick={() => router.push(getRoute(routes.auth.signIn, { returnUrl: `/accept-invite?token=${token}` }, true))}
            className="w-full bg-theme-primary text-theme-inverted hover:bg-theme-primary/90 font-mono uppercase text-xs tracking-wider"
          >
            <LogIn className="mr-2 size-4" />
            Sign In to Continue
          </Button>

          <div className="text-center">
            <p className="text-sm text-theme-secondary font-mono">
              Don&apos;t have an account?{" "}
              <a
                href={getRoute(routes.auth.signUp, { returnUrl: `/accept-invite?token=${token}` }, true)}
                className="text-theme-primary hover:underline"
              >
                Sign up
              </a>
            </p>
          </div>
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
