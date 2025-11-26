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
  orgId: string;
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
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = authClient.useSession();

  const fetchOrganizations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/organization");
      if (!response.ok) {
        throw new Error("Failed to fetch organizations");
      }
      const data = (await response.json()) as { organizations: Organization[] };
      setOrganizations(data.organizations || []);
    } catch (error) {
      console.error("Error fetching organizations:", error);
      setOrganizations([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchOrganizations();
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
          refetch: fetchOrganizations,
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  }

  const user = session.user;
  const currentOrgId = (user as { orgId?: string }).orgId || "";
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
    refetch: fetchOrganizations,
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
