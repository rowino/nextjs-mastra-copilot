"use client";

import { useState } from "react";
import { useAuthContext } from "@/hooks/use-auth-context";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

type Member = {
  id: string;
  userId: string;
  name: string | null;
  email: string;
  role: "admin" | "user";
  createdAt: string;
};

interface MemberListProps {
  orgId: string;
  members: Member[];
  onMembersChange: () => void;
}

export function MemberList({ orgId, members, onMembersChange }: MemberListProps) {
  const { isAdmin, userId } = useAuthContext();
  const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

  const handleRoleChange = async (memberId: string, newRole: "admin" | "user") => {
    if (!isAdmin) {
      toast.error("Only admins can change member roles");
      return;
    }

    try {
      setUpdatingMemberId(memberId);

      const response = await fetch(`/api/organization/${orgId}/members`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, role: newRole }),
      });

      if (!response.ok) {
        const error = (await response.json()) as { error: string };
        throw new Error(error.error || "Failed to update member role");
      }

      toast.success("Member role updated successfully");
      onMembersChange();
    } catch (error) {
      console.error("Error updating member role:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update member role"
      );
    } finally {
      setUpdatingMemberId(null);
    }
  };

  const handleRemoveMember = async () => {
    if (!removingMemberId) return;

    const member = members.find((m) => m.id === removingMemberId);
    const isSelf = member?.userId === userId;

    if (!isSelf && !isAdmin) {
      toast.error("Only admins can remove members");
      return;
    }

    try {
      const response = await fetch(
        `/api/organization/${orgId}/members?memberId=${removingMemberId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const error = (await response.json()) as { error: string };
        throw new Error(error.error || "Failed to remove member");
      }

      const result = (await response.json()) as { message: string };
      toast.success(result.message || "Member removed successfully");

      setShowRemoveDialog(false);
      setRemovingMemberId(null);

      if (isSelf) {
        window.location.reload();
      } else {
        onMembersChange();
      }
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to remove member"
      );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No members found
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => {
                const isSelf = member.userId === userId;
                return (
                  <TableRow
                    key={member.id}
                    className={isSelf ? "bg-accent/50" : ""}
                  >
                    <TableCell className="font-medium">
                      {member.name || "—"}
                      {isSelf && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          (You)
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      {isAdmin && !isSelf ? (
                        <Select
                          value={member.role}
                          onValueChange={(value: "admin" | "user") =>
                            handleRoleChange(member.id, value)
                          }
                          disabled={updatingMemberId === member.id}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="user">User</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="capitalize">{member.role}</span>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(member.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      {(isAdmin || isSelf) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setRemovingMemberId(member.id);
                            setShowRemoveDialog(true);
                          }}
                          disabled={!isAdmin && !isSelf}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Member</DialogTitle>
            <DialogDescription>
              {removingMemberId &&
              members.find((m) => m.id === removingMemberId)?.userId === userId
                ? "Are you sure you want to leave this organization?"
                : "Are you sure you want to remove this member from the organization?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRemoveDialog(false);
                setRemovingMemberId(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemoveMember}>
              {removingMemberId &&
              members.find((m) => m.id === removingMemberId)?.userId === userId
                ? "Leave Organization"
                : "Remove Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
