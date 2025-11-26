"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/hooks/use-auth-context";
import { OrgSettings } from "@/components/organization/org-settings";
import { MemberList } from "@/components/organization/member-list";
import { InviteMember } from "@/components/organization/invite-member";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

type Organization = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  createdAt: string;
};

type Member = {
  id: string;
  userId: string;
  name: string | null;
  email: string;
  role: "admin" | "user";
  createdAt: string;
};

export default function OrganizationSettingsPage() {
  const router = useRouter();
  const { orgId, isLoading: authLoading } = useAuthContext();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrganization = async () => {
    if (!orgId) return;

    try {
      const response = await fetch(`/api/organization/${orgId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch organization");
      }
      const data = (await response.json()) as Organization;
      setOrganization(data);
    } catch (error) {
      console.error("Error fetching organization:", error);
    }
  };

  const fetchMembers = async () => {
    if (!orgId) return;

    try {
      const response = await fetch(`/api/organization/${orgId}/members`);
      if (!response.ok) {
        throw new Error("Failed to fetch members");
      }
      const data = (await response.json()) as { members: Member[] };
      setMembers(data.members || []);
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchOrganization(), fetchMembers()]);
    setIsLoading(false);
  }, [orgId]);

  useEffect(() => {
    if (!authLoading && orgId) {
      fetchData();
    } else if (!authLoading && !orgId) {
      router.push("/dashboard");
    }
  }, [orgId, authLoading, router, fetchData]);

  if (authLoading || isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="h-8 w-64 bg-white/10 rounded animate-pulse" />
          <div className="h-96 bg-white/10 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Organization not found
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Organization Settings</h1>
          <p className="text-white/60 mt-2">
            Manage your organization settings and members
          </p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <OrgSettings organization={organization} />
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-2 space-y-6">
                <Card>
                  <CardContent className="pt-6">
                    <MemberList
                      orgId={orgId}
                      members={members}
                      onMembersChange={fetchMembers}
                    />
                  </CardContent>
                </Card>
              </div>
              <div>
                <InviteMember orgId={orgId} onMemberAdded={fetchMembers} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
