"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { routes, getRoute } from "@/lib/routes";
import { useAuthContext } from "@/hooks/use-auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Building2,
  Loader2,
  Check,
  LogOut,
  Mail,
  Plus,
  X,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Organization = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  role: "admin" | "user";
};

type Invitation = {
  id: string;
  organizationId: string;
  organizationName: string;
  role: "admin" | "user";
  token: string;
  expiresAt: Date;
  createdAt: Date;
  inviterName: string | null;
  inviterEmail: string;
};

const createOrgSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  slug: z.string().optional(),
  logo: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type CreateOrgFormValues = z.infer<typeof createOrgSchema>;

export function OrganizationsManager() {
  const router = useRouter();
  const { orgId } = useAuthContext();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [pendingInvites, setPendingInvites] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [leavingOrgId, setLeavingOrgId] = useState<string | null>(null);
  const [rejectingInviteId, setRejectingInviteId] = useState<string | null>(
    null
  );

  const form = useForm<CreateOrgFormValues>({
    resolver: zodResolver(createOrgSchema),
    defaultValues: {
      name: "",
      slug: "",
      logo: "",
    },
  });

  const fetchOrganizations = useCallback(async () => {
    try {
      const response = await fetch(getRoute(routes.api.organization.root));
      if (response.ok) {
        const data = (await response.json()) as { organizations: Organization[] };
        setOrganizations(data.organizations || []);
      }
    } catch (error) {
      console.error("Error fetching organizations:", error);
    }
  }, []);

  const fetchPendingInvites = useCallback(async () => {
    try {
      const response = await fetch(getRoute(routes.api.invitations.user));
      if (response.ok) {
        const data = (await response.json()) as { invitations: Invitation[] };
        setPendingInvites(data.invitations || []);
      }
    } catch (error) {
      console.error("Error fetching pending invites:", error);
    }
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchOrganizations(), fetchPendingInvites()]);
    setIsLoading(false);
  }, [fetchOrganizations, fetchPendingInvites]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateOrganization = async (data: CreateOrgFormValues) => {
    try {
      setIsCreating(true);

      const response = await fetch(getRoute(routes.api.organization.root), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          slug: data.slug || undefined,
          logo: data.logo || undefined,
        }),
      });

      if (!response.ok) {
        const error = (await response.json()) as { error: string };
        throw new Error(error.error || "Failed to create organization");
      }

      const org = (await response.json()) as Organization;

      const switchResponse = await fetch(
        getRoute(routes.api.organization.switch),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orgId: org.id }),
        }
      );

      if (!switchResponse.ok) {
        const errorData = (await switchResponse.json()) as { error?: string };
        throw new Error(
          errorData.error || "Failed to switch to organization"
        );
      }

      toast.success("Organization created successfully");
      form.reset();
      await loadData();

      window.location.href = getRoute(routes.dashboard);
    } catch (error) {
      console.error("Error creating organization:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create organization"
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleSwitchOrganization = async (newOrgId: string) => {
    try {
      const response = await fetch(getRoute(routes.api.organization.switch), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId: newOrgId }),
      });

      if (!response.ok) {
        const error = (await response.json()) as { error: string };
        throw new Error(error.error || "Failed to switch organization");
      }

      toast.success("Switched organization");
      window.location.href = getRoute(routes.dashboard);
    } catch (error) {
      console.error("Error switching organization:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to switch organization"
      );
    }
  };

  const handleLeaveOrganization = async (leaveOrgId: string) => {
    try {
      setLeavingOrgId(leaveOrgId);

      const response = await fetch(getRoute(routes.api.organization.leave), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId: leaveOrgId }),
      });

      if (!response.ok) {
        const error = (await response.json()) as { error: string };
        throw new Error(error.error || "Failed to leave organization");
      }

      toast.success("Left organization successfully");
      await loadData();

      if (leaveOrgId === orgId) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error leaving organization:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to leave organization"
      );
    } finally {
      setLeavingOrgId(null);
    }
  };

  const handleAcceptInvite = (token: string) => {
    router.push(getRoute(routes.organization.acceptInvite, { token }));
  };

  const handleRejectInvite = async (inviteId: string, orgId: string) => {
    try {
      setRejectingInviteId(inviteId);

      const response = await fetch(
        getRoute(routes.api.organization.invitations, { orgId }) +
          `?invitationId=${inviteId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const error = (await response.json()) as { error: string };
        throw new Error(error.error || "Failed to reject invitation");
      }

      toast.success("Invitation rejected");
      await fetchPendingInvites();
    } catch (error) {
      console.error("Error rejecting invitation:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to reject invitation"
      );
    } finally {
      setRejectingInviteId(null);
    }
  };

  const canLeaveOrg = (org: Organization) => {
    if (org.role !== "admin") return true;

    const adminCount = organizations.filter(
      (o) => o.id === org.id && o.role === "admin"
    ).length;

    return adminCount > 1;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-theme-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {organizations.length === 0 && (
        <div className="border border-theme-border-base rounded-lg p-6 bg-theme-bg-elevated">
          <div className="flex items-start gap-3">
            <AlertCircle className="size-5 text-theme-primary mt-0.5" />
            <div>
              <h3 className="text-theme-foreground font-medium font-mono">
                No Organization
              </h3>
              <p className="text-theme-secondary text-sm font-mono mt-1">
                You don&apos;t belong to any organization yet. Create one below or
                accept a pending invitation.
              </p>
            </div>
          </div>
        </div>
      )}

      {organizations.length > 0 && (
        <>
          <div className="relative">
            <div className="absolute inset-x-0 top-3 border-t border-theme-border-base" />
            <h2 className="relative inline-block bg-theme-bg-base pr-4 text-sm font-mono uppercase tracking-wider text-theme-secondary">
              <Building2 className="inline-block size-4 mr-2 mb-1" />
              Your Organizations
            </h2>
          </div>

          <div className="grid gap-4">
            {organizations.map((org) => (
              <div
                key={org.id}
                className="border border-theme-border-base rounded-lg p-4 bg-theme-bg-elevated"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 bg-theme-bg-base rounded border border-theme-border-base">
                      <Building2 className="size-5 text-theme-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-theme-foreground font-medium font-mono">
                          {org.name}
                        </h3>
                        {org.id === orgId && (
                          <span className="px-2 py-0.5 text-xs bg-theme-primary/20 text-theme-foreground rounded font-mono uppercase tracking-wider">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-theme-secondary font-mono">
                        {org.role} • {org.slug}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {org.id !== orgId && (
                      <Button
                        size="sm"
                        onClick={() => handleSwitchOrganization(org.id)}
                        className="bg-theme-primary text-theme-inverted hover:bg-theme-primary/90 font-mono uppercase text-xs tracking-wider transition-colors duration-150 ease-linear"
                      >
                        <Check className="size-4 mr-1" />
                        Switch
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLeaveOrganization(org.id)}
                      disabled={
                        leavingOrgId === org.id || !canLeaveOrg(org)
                      }
                      title={
                        !canLeaveOrg(org)
                          ? "Cannot leave - you are the only admin"
                          : undefined
                      }
                      className="bg-transparent hover:bg-theme-border-base border-theme-border-base text-theme-foreground font-mono uppercase text-xs tracking-wider transition-colors duration-150 ease-linear"
                    >
                      {leavingOrgId === org.id ? (
                        <Loader2 className="size-4 mr-1 animate-spin" />
                      ) : (
                        <LogOut className="size-4 mr-1" />
                      )}
                      Leave
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {pendingInvites.length > 0 && (
        <>
          <div className="relative">
            <div className="absolute inset-x-0 top-3 border-t border-theme-border-base" />
            <h2 className="relative inline-block bg-theme-bg-base pr-4 text-sm font-mono uppercase tracking-wider text-theme-secondary">
              <Mail className="inline-block size-4 mr-2 mb-1" />
              Pending Invitations
            </h2>
          </div>

          <div className="grid gap-4">
            {pendingInvites.map((invite) => (
              <div
                key={invite.id}
                className="border border-theme-border-base rounded-lg p-4 bg-theme-bg-elevated"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 bg-theme-bg-base rounded border border-theme-border-base">
                      <Mail className="size-5 text-theme-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-theme-foreground font-medium font-mono">
                        {invite.organizationName}
                      </h3>
                      <p className="text-sm text-theme-secondary font-mono">
                        {invite.role} • Invited by{" "}
                        {invite.inviterName || invite.inviterEmail}
                      </p>
                      <p className="text-xs text-theme-muted font-mono mt-1">
                        Expires{" "}
                        {new Date(invite.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleAcceptInvite(invite.token)}
                      className="bg-theme-primary text-theme-inverted hover:bg-theme-primary/90 font-mono uppercase text-xs tracking-wider transition-colors duration-150 ease-linear"
                    >
                      <Check className="size-4 mr-1" />
                      Accept
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleRejectInvite(invite.id, invite.organizationId)
                      }
                      disabled={rejectingInviteId === invite.id}
                      className="bg-transparent hover:bg-theme-border-base border-theme-border-base text-theme-foreground font-mono uppercase text-xs tracking-wider transition-colors duration-150 ease-linear"
                    >
                      {rejectingInviteId === invite.id ? (
                        <Loader2 className="size-4 mr-1 animate-spin" />
                      ) : (
                        <X className="size-4 mr-1" />
                      )}
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="relative">
        <div className="absolute inset-x-0 top-3 border-t border-theme-border-base" />
        <h2 className="relative inline-block bg-theme-bg-base pr-4 text-sm font-mono uppercase tracking-wider text-theme-secondary">
          <Plus className="inline-block size-4 mr-2 mb-1" />
          Create Organization
        </h2>
      </div>

      <div className="border border-theme-border-base rounded-lg p-6 bg-theme-bg-elevated">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleCreateOrganization)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-theme-secondary font-mono uppercase text-xs tracking-wider">
                    Organization Name *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Acme Inc."
                      {...field}
                      disabled={isCreating}
                      className="bg-theme-bg-base border-theme-border-base text-theme-foreground placeholder:text-theme-muted focus:border-theme-primary focus:ring-1 focus:ring-theme-primary font-mono transition-colors duration-150 ease-linear"
                    />
                  </FormControl>
                  <FormMessage className="text-theme-error font-mono text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-theme-secondary font-mono uppercase text-xs tracking-wider">
                    Slug (Optional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="acme-inc"
                      {...field}
                      disabled={isCreating}
                      className="bg-theme-bg-base border-theme-border-base text-theme-foreground placeholder:text-theme-muted focus:border-theme-primary focus:ring-1 focus:ring-theme-primary font-mono transition-colors duration-150 ease-linear"
                    />
                  </FormControl>
                  <FormDescription className="text-theme-muted font-mono text-xs">
                    Leave blank to auto-generate from organization name
                  </FormDescription>
                  <FormMessage className="text-theme-error font-mono text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="logo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-theme-secondary font-mono uppercase text-xs tracking-wider">
                    Logo URL (Optional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/logo.png"
                      {...field}
                      disabled={isCreating}
                      className="bg-theme-bg-base border-theme-border-base text-theme-foreground placeholder:text-theme-muted focus:border-theme-primary focus:ring-1 focus:ring-theme-primary font-mono transition-colors duration-150 ease-linear"
                    />
                  </FormControl>
                  <FormMessage className="text-theme-error font-mono text-xs" />
                </FormItem>
              )}
            />

            <div className="pt-4 border-t border-theme-border-base">
              <Button
                type="submit"
                disabled={isCreating}
                className="w-full bg-theme-primary text-theme-inverted hover:bg-theme-primary/90 font-mono uppercase text-xs tracking-wider transition-colors duration-150 ease-linear"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Building2 className="mr-2 size-4" />
                    Create Organization
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
