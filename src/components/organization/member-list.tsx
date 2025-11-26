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
import { Trash2, Users } from "lucide-react";

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
      <div className="border border-[#2a2a2a] rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-[#2a2a2a] hover:bg-transparent">
              <TableHead className="text-[#888888] font-mono uppercase tracking-wider text-xs">Name</TableHead>
              <TableHead className="text-[#888888] font-mono uppercase tracking-wider text-xs">Email</TableHead>
              <TableHead className="text-[#888888] font-mono uppercase tracking-wider text-xs">Role</TableHead>
              <TableHead className="text-[#888888] font-mono uppercase tracking-wider text-xs">Joined</TableHead>
              <TableHead className="text-right text-[#888888] font-mono uppercase tracking-wider text-xs">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.length === 0 ? (
              <TableRow className="border-[#2a2a2a] hover:bg-transparent">
                <TableCell colSpan={5} className="text-center text-[#888888] font-mono">
                  No members found
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => {
                const isSelf = member.userId === userId;
                return (
                  <TableRow
                    key={member.id}
                    className={`border-[#2a2a2a] hover:border-l-4 hover:border-l-[#00ff88] transition-all duration-150 ease-linear ${isSelf ? "bg-[#141414]" : ""}`}
                  >
                    <TableCell className="font-mono text-[#e5e5e5]">
                      {member.name || "—"}
                      {isSelf && (
                        <span className="ml-2 text-xs text-[#888888]">
                          (You)
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-[#e5e5e5]">{member.email}</TableCell>
                    <TableCell>
                      {isAdmin && !isSelf ? (
                        <Select
                          value={member.role}
                          onValueChange={(value: "admin" | "user") =>
                            handleRoleChange(member.id, value)
                          }
                          disabled={updatingMemberId === member.id}
                        >
                          <SelectTrigger className="w-[120px] bg-[#141414] border-[#2a2a2a] text-[#e5e5e5] font-mono uppercase text-xs tracking-wider focus:border-[#00ff88]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#141414] border-[#2a2a2a] text-[#e5e5e5]">
                            <SelectItem value="admin" className="text-[#e5e5e5] font-mono uppercase text-xs focus:bg-[#2a2a2a] focus:text-[#00ff88]">Admin</SelectItem>
                            <SelectItem value="user" className="text-[#e5e5e5] font-mono uppercase text-xs focus:bg-[#2a2a2a] focus:text-[#00ff88]">User</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="uppercase text-[#888888] font-mono text-xs tracking-wider">{member.role}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-[#888888] font-mono text-xs">{formatDate(member.createdAt)}</TableCell>
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
                          className="text-[#ff4444] hover:text-[#ff4444] hover:bg-[#ff4444]/10 transition-colors duration-150 ease-linear"
                        >
                          <Trash2 className="h-4 w-4" />
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
        <DialogContent className="bg-[#141414] border-[#2a2a2a] text-[#e5e5e5] font-mono">
          <DialogHeader>
            <DialogTitle className="text-[#e5e5e5] font-mono uppercase tracking-wider">Remove Member</DialogTitle>
            <DialogDescription className="text-[#888888] font-mono">
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
              className="bg-transparent hover:bg-[#2a2a2a] border-[#2a2a2a] text-[#e5e5e5] font-mono uppercase text-xs tracking-wider transition-colors duration-150 ease-linear"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveMember}
              className="bg-[#ff4444] hover:bg-[#ff4444]/90 text-[#0a0a0a] font-mono uppercase text-xs tracking-wider transition-colors duration-150 ease-linear"
            >
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
