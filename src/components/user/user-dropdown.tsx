"use client";

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { UserAvatar } from "./user-avatar";

interface UserDropdownProps {
  user: {
    name?: string;
    email: string;
    image?: string | null;
  };
}

export function UserDropdown({ user }: UserDropdownProps) {
  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      window.location.href = "/";
    } catch (error) {
      console.error("Failed to sign out:", error);
      alert("Failed to sign out. Please try again.");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="cursor-pointer focus:outline-none">
          <UserAvatar user={user} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-black/80 backdrop-blur-xl border-white/10"
      >
        <div className="px-2 py-1.5">
          <p className="text-sm font-bold text-white">
            {user.name || "User"}
          </p>
          <p className="text-xs text-white/60">{user.email}</p>
        </div>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="cursor-pointer text-white">
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="cursor-pointer text-white">
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-red-400 cursor-pointer focus:text-red-400"
        >
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
