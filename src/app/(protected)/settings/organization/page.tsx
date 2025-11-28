"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/hooks/use-auth-context";
import { OrgSettings } from "@/components/organization/org-settings";
import { MemberList } from "@/components/organization/member-list";
import { InviteMember } from "@/components/organization/invite-member";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Users, Loader2, UserPlus } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState("general");

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
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-[#00ff88]" />
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="container max-w-5xl mx-auto py-8 px-4">
        <div className="border border-[#2a2a2a] rounded-lg p-8 text-center">
          <p className="text-[#888888] font-mono">Organization not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#00ff88] font-mono uppercase tracking-wider">Organization</h1>
        <p className="text-[#888888] mt-2 font-mono text-sm">
          Manage your organization settings and members
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-transparent border-b border-[#2a2a2a] rounded-none p-0 mb-8 h-auto gap-0">
          <TabsTrigger
            value="general"
            className="bg-transparent data-[state=active]:bg-transparent text-[#888888] data-[state=active]:text-[#00ff88] border-b-2 border-transparent data-[state=active]:border-[#00ff88] rounded-none px-6 py-3 font-mono uppercase text-xs tracking-wider transition-all duration-150 ease-linear relative -mb-[1px]"
          >
            <Building2 className="size-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger
            value="members"
            className="bg-transparent data-[state=active]:bg-transparent text-[#888888] data-[state=active]:text-[#00ff88] border-b-2 border-transparent data-[state=active]:border-[#00ff88] rounded-none px-6 py-3 font-mono uppercase text-xs tracking-wider transition-all duration-150 ease-linear relative -mb-[1px]"
          >
            <Users className="size-4 mr-2" />
            Members
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-8">
          {/* General Settings Section */}
          <div className="relative">
            <div className="absolute inset-x-0 top-3 border-t border-[#2a2a2a]" />
            <h2 className="relative inline-block bg-[#0a0a0a] pr-4 text-sm font-mono uppercase tracking-wider text-[#888888]">
              <Building2 className="inline-block size-4 mr-2 mb-1" />
              Organization Details
            </h2>
          </div>

          <OrgSettings organization={organization} />
        </TabsContent>

        <TabsContent value="members" className="space-y-8">
          {/* Team Roster Section */}
          <div className="relative">
            <div className="absolute inset-x-0 top-3 border-t border-[#2a2a2a]" />
            <h2 className="relative inline-block bg-[#0a0a0a] pr-4 text-sm font-mono uppercase tracking-wider text-[#888888]">
              <Users className="inline-block size-4 mr-2 mb-1" />
              Team Roster
            </h2>
          </div>

          <MemberList
            orgId={orgId}
            members={members}
            onMembersChange={fetchMembers}
          />

          {/* Invite Member Section */}
          <div className="relative">
            <div className="absolute inset-x-0 top-3 border-t border-[#2a2a2a]" />
            <h2 className="relative inline-block bg-[#0a0a0a] pr-4 text-sm font-mono uppercase tracking-wider text-[#888888]">
              <UserPlus className="inline-block size-4 mr-2 mb-1" />
              Add Member
            </h2>
          </div>

          <InviteMember orgId={orgId} onMemberAdded={fetchMembers} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
