"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthContext } from "@/hooks/use-auth-context";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";

const inviteMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "user"], { required_error: "Role is required" }),
});

type InviteMemberFormValues = z.infer<typeof inviteMemberSchema>;

interface InviteMemberProps {
  orgId: string;
  onMemberAdded: () => void;
}

export function InviteMember({ orgId, onMemberAdded }: InviteMemberProps) {
  const { isAdmin } = useAuthContext();
  const [isInviting, setIsInviting] = useState(false);

  const form = useForm<InviteMemberFormValues>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: "",
      role: "user",
    },
  });

  const onSubmit = async (data: InviteMemberFormValues) => {
    if (!isAdmin) {
      toast.error("Only admins can invite members");
      return;
    }

    try {
      setIsInviting(true);

      const response = await fetch(`/api/organization/${orgId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = (await response.json()) as { error: string };
        throw new Error(error.error || "Failed to invite member");
      }

      const result = (await response.json()) as { message: string };
      toast.success(result.message || "Member invited successfully");
      form.reset();
      onMemberAdded();
    } catch (error) {
      console.error("Error inviting member:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to invite member"
      );
    } finally {
      setIsInviting(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-3 items-end">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel className="text-theme-secondary font-mono uppercase text-xs tracking-wider">Email Address</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="user@example.com"
                  {...field}
                  disabled={isInviting}
                  className="bg-theme-bg-elevated border-theme-border-base text-theme-foreground placeholder:text-theme-muted focus:border-theme-primary focus:ring-1 focus:ring-theme-primary font-mono transition-colors duration-150 ease-linear"
                />
              </FormControl>
              <FormMessage className="text-theme-error font-mono text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem className="w-32">
              <FormLabel className="text-theme-secondary font-mono uppercase text-xs tracking-wider">Role</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isInviting}
              >
                <FormControl>
                  <SelectTrigger className="bg-theme-bg-elevated border-theme-border-base text-theme-foreground focus:border-theme-primary focus:ring-1 focus:ring-theme-primary font-mono uppercase text-xs tracking-wider transition-colors duration-150 ease-linear">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-theme-bg-elevated border-theme-border-base text-theme-foreground">
                  <SelectItem value="user" className="text-theme-foreground font-mono uppercase text-xs focus:bg-theme-bg-hover focus:text-theme-foreground">User</SelectItem>
                  <SelectItem value="admin" className="text-theme-foreground font-mono uppercase text-xs focus:bg-theme-bg-hover focus:text-theme-foreground">Admin</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage className="text-theme-error font-mono text-xs" />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isInviting}
          className="bg-theme-primary text-theme-inverted hover:bg-theme-primary/90 font-mono uppercase text-xs tracking-wider h-10 px-6 transition-colors duration-150 ease-linear"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          {isInviting ? "Inviting..." : "Invite"}
        </Button>
      </form>
    </Form>
  );
}
