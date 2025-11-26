"use client";

import { useState } from "react";
import Image from "next/image";
import { useAuthContext } from "@/hooks/use-auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Building2, Plus } from "lucide-react";
import { CreateOrgModal } from "./create-org-modal";
import { toast } from "sonner";

export function OrgSwitcher() {
  const { currentOrganization, organizations, isLoading } = useAuthContext();
  const [isSwitching, setIsSwitching] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleSwitch = async (orgId: string) => {
    if (orgId === currentOrganization?.id) return;

    try {
      setIsSwitching(true);
      const response = await fetch("/api/organization/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: orgId }),
      });

      if (!response.ok) {
        throw new Error("Failed to switch organization");
      }

      toast.success("Switched organization");
      window.location.reload();
    } catch (error) {
      console.error("Error switching organization:", error);
      toast.error("Failed to switch organization");
      setIsSwitching(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-9 w-48 bg-white/5 rounded-md animate-pulse" />
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="min-w-[200px] justify-between bg-white/5 border-white/10 hover:bg-white/10"
            disabled={isSwitching}
          >
            <div className="flex items-center gap-2 truncate">
              <Building2 className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">
                {currentOrganization?.name || "Select Organization"}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 flex-shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuLabel>Organizations</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {organizations.map((org) => (
            <DropdownMenuItem
              key={org.id}
              onClick={() => handleSwitch(org.id)}
              className={
                org.id === currentOrganization?.id
                  ? "bg-accent"
                  : ""
              }
            >
              <div className="flex items-center gap-2 w-full">
                {org.logo ? (
                  <Image
                    src={org.logo}
                    alt={org.name}
                    width={20}
                    height={20}
                    className="rounded-sm"
                  />
                ) : (
                  <Building2 className="h-4 w-4" />
                )}
                <span className="truncate">{org.name}</span>
              </div>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Organization
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateOrgModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />
    </>
  );
}
