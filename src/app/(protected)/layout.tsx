"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { UserDropdown } from "@/components/user/user-dropdown";
import { AuthProvider } from "@/hooks/use-auth-context";
import { OrgSwitcher } from "@/components/organization/org-switcher";

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white/60"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950">
        <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-8">
                <Link
                  href="/"
                  className="text-xl font-bold text-white hover:text-white/80 transition-colors"
                >
                  Mastra
                </Link>
                <nav className="flex items-center gap-6">
                  <Link
                    href="/dashboard"
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/settings/organization"
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    Settings
                  </Link>
                </nav>
              </div>
              <div className="flex items-center gap-4">
                <OrgSwitcher />
                <UserDropdown user={session.user} />
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </AuthProvider>
  );
}
