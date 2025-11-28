"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

type Organization = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  role: "admin" | "user";
  createdAt: string;
};

type AuthContextType = {
  userId: string;
  email: string;
  orgId: string | null;
  roles: ("admin" | "user")[];
  organizations: Organization[];
  isAdmin: boolean;
  isLoading: boolean;
  currentOrganization: Organization | null;
  refetch: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrgId, setCurrentOrgId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = authClient.useSession();

  const fetchData = async () => {
    try {
      setIsLoading(true);

      // Fetch organizations and current context in parallel
      const [orgsResponse, currentResponse] = await Promise.all([
        fetch("/api/organization"),
        fetch("/api/organization/current"),
      ]);

      if (!orgsResponse.ok || !currentResponse.ok) {
        throw new Error("Failed to fetch organization data");
      }

      const orgsData = (await orgsResponse.json()) as { organizations: Organization[] };
      const currentData = (await currentResponse.json()) as { orgId: string | null };

      setOrganizations(orgsData.organizations || []);
      setCurrentOrgId(currentData.orgId || "");
    } catch (error) {
      console.error("Error fetching organization data:", error);
      setOrganizations([]);
      setCurrentOrgId("");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, [session?.user]);

  if (!session?.user) {
    return (
      <AuthContext.Provider
        value={{
          userId: "",
          email: "",
          orgId: "",
          roles: [],
          organizations: [],
          isAdmin: false,
          isLoading: false,
          currentOrganization: null,
          refetch: fetchData,
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  }

  const user = session.user;
  const currentOrg = organizations.find((org) => org.id === currentOrgId) || null;
  const roles = currentOrg ? [currentOrg.role] : [];
  const isAdmin = roles.includes("admin");

  const contextValue: AuthContextType = {
    userId: user.id,
    email: user.email,
    orgId: currentOrgId,
    roles,
    organizations,
    isAdmin,
    isLoading,
    currentOrganization: currentOrg,
    refetch: fetchData,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
}
