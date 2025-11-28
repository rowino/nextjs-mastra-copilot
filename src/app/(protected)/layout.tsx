"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { UserDropdown } from "@/components/user/user-dropdown";
import { AuthProvider, useAuthContext } from "@/hooks/use-auth-context";
import { OrgSwitcher } from "@/components/organization/org-switcher";

function OrgRedirectGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { orgId, isLoading } = useAuthContext();

  useEffect(() => {
    if (!isLoading && !orgId && pathname !== "/create-organization") {
      router.replace("/create-organization");
    }
  }, [isLoading, orgId, pathname, router]);

  // Don't render children if redirecting
  if (!isLoading && !orgId && pathname !== "/create-organization") {
    return null;
  }

  return <>{children}</>;
}

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/signin");
    }
  }, [isPending, session, router]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-theme-bg-base">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-theme-primary"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <AuthProvider>
      <OrgRedirectGuard>
        <LayoutContent session={session}>{children}</LayoutContent>
      </OrgRedirectGuard>
    </AuthProvider>
  );
}

function LayoutContent({
  children,
  session,
}: {
  children: React.ReactNode;
  session: { user: { id: string; email: string; name?: string | null } };
}) {
  const pathname = usePathname();
  const { orgId } = useAuthContext();
  const showHeader = orgId || pathname === "/create-organization";

  return (
    <div className="min-h-screen flex flex-col bg-theme-bg-base font-mono">
      {showHeader && (
        <header className="border-b border-theme-border-base">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-8">
                <Link
                  href="/"
                  className="text-xl font-bold text-theme-foreground hover:text-theme-foreground/80 transition-colors duration-150 ease-linear"
                >
                  MASTRA
                </Link>
                {orgId && (
                  <nav className="flex items-center gap-6">
                    <Link
                      href="/dashboard"
                      className="text-sm text-theme-secondary hover:text-theme-foreground transition-colors duration-150 ease-linear uppercase tracking-wider"
                    >
                      Dashboard
                    </Link>
                  </nav>
                )}
              </div>
              <div className="flex items-center gap-4">
                {orgId && <OrgSwitcher />}
                <UserDropdown user={session.user} />
              </div>
            </div>
          </div>
        </header>
      )}
      <main className="flex-1">{children}</main>
    </div>
  );
}
