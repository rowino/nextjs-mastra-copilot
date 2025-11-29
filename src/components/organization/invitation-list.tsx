"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, X, Mail, Clock } from "lucide-react";
import { toast } from "sonner";
import { routes, getRoute } from "@/lib/routes";

interface Invitation {
  id: string;
  email: string;
  role: "admin" | "user";
  invitedBy: string;
  invitedByEmail: string;
  createdAt: Date;
  expiresAt: Date;
  status: string;
}

interface InvitationListProps {
  orgId: string;
}

export function InvitationList({ orgId }: InvitationListProps) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchInvitations = async () => {
    try {
      const response = await fetch(getRoute(routes.api.organization.invitations, { orgId }));
      if (!response.ok) {
        throw new Error("Failed to fetch invitations");
      }
      const data = (await response.json()) as { invitations: Invitation[] };
      setInvitations(data.invitations);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to fetch invitations"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, [orgId]);

  const handleCancelInvitation = async (invitationId: string) => {
    setCancellingId(invitationId);
    try {
      const response = await fetch(
        getRoute(routes.api.organization.invitations, { orgId, invitationId }),
        { method: "DELETE" }
      );

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "Failed to cancel invitation");
      }

      toast.success("Invitation cancelled successfully");

      // Refresh the list
      await fetchInvitations();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to cancel invitation"
      );
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isExpiringSoon = (expiresAt: Date) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const hoursUntilExpiry =
      (expires.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilExpiry < 24 && hoursUntilExpiry > 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-theme-foreground" />
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="p-4 bg-theme-bg-card rounded-full">
          <Mail className="size-12 text-theme-secondary" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-lg font-medium text-theme-foreground">
            No pending invitations
          </h3>
          <p className="text-sm text-theme-secondary">
            Invitations you send will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {invitations.map((invitation) => (
          <div
            key={invitation.id}
            className="p-4 bg-theme-bg-card border border-theme-border-base rounded-lg hover:border-theme-border-hover transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <Mail className="size-5 text-theme-foreground" />
                  <div>
                    <p className="font-medium text-theme-foreground">
                      {invitation.email}
                    </p>
                    <p className="text-sm text-theme-secondary">
                      Invited by {invitation.invitedBy} ({invitation.invitedByEmail})
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-theme-secondary">Role:</span>
                    <span
                      className={
                        invitation.role === "admin"
                          ? "px-2 py-1 bg-theme-role-admin-bg border border-theme-role-admin-border text-theme-role-admin-text rounded text-xs font-medium"
                          : "px-2 py-1 bg-theme-role-user-bg border border-theme-role-user-border text-theme-role-user-text rounded text-xs font-medium"
                      }
                    >
                      {invitation.role}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-theme-secondary">
                    <Clock className="size-4" />
                    <span>Sent {formatDate(invitation.createdAt)}</span>
                  </div>

                  <div
                    className={`flex items-center gap-2 ${
                      isExpiringSoon(invitation.expiresAt)
                        ? "text-theme-warning"
                        : "text-theme-secondary"
                    }`}
                  >
                    <Clock className="size-4" />
                    <span>Expires {formatDate(invitation.expiresAt)}</span>
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCancelInvitation(invitation.id)}
                disabled={cancellingId === invitation.id}
                className="text-theme-error hover:text-theme-error hover:bg-theme-error-bg"
              >
                {cancellingId === invitation.id ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <X className="size-4" />
                )}
                <span className="ml-2">Cancel</span>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
