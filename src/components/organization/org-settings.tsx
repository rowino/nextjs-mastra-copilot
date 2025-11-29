"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/hooks/use-auth-context";
import { routes, getRoute } from "@/lib/routes";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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

const orgSettingsSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  slug: z.string().min(1, "Slug is required"),
  logo: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type OrgSettingsFormValues = z.infer<typeof orgSettingsSchema>;

interface OrgSettingsProps {
  organization: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
  };
}

export function OrgSettings({ organization }: OrgSettingsProps) {
  const { isAdmin, organizations } = useAuthContext();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isOnlyOrganization = organizations.length === 1;

  const form = useForm<OrgSettingsFormValues>({
    resolver: zodResolver(orgSettingsSchema),
    defaultValues: {
      name: organization.name,
      slug: organization.slug,
      logo: organization.logo || "",
    },
  });

  const onSubmit = async (data: OrgSettingsFormValues) => {
    if (!isAdmin) {
      toast.error("Only admins can update organization settings");
      return;
    }

    try {
      setIsSaving(true);

      const response = await fetch(getRoute(routes.api.organization.byId, { orgId: organization.id }), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          slug: data.slug,
          logo: data.logo || undefined,
        }),
      });

      if (!response.ok) {
        const error = (await response.json()) as { error: string };
        throw new Error(error.error || "Failed to update organization");
      }

      toast.success("Organization updated successfully");
      window.location.reload();
    } catch (error) {
      console.error("Error updating organization:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update organization"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isAdmin) {
      toast.error("Only admins can delete organizations");
      return;
    }

    try {
      setIsDeleting(true);

      const response = await fetch(getRoute(routes.api.organization.byId, { orgId: organization.id }), {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = (await response.json()) as { error: string };
        throw new Error(error.error || "Failed to delete organization");
      }

      toast.success("Organization deleted successfully");
      router.push(getRoute(routes.dashboard));
      window.location.reload();
    } catch (error) {
      console.error("Error deleting organization:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete organization"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="border border-theme-border-base rounded-lg p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-theme-secondary font-mono uppercase text-xs tracking-wider">Organization Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Acme Inc."
                      {...field}
                      disabled={!isAdmin || isSaving}
                      className="bg-theme-bg-elevated border-theme-border-base text-theme-foreground placeholder:text-theme-muted focus:border-theme-primary focus:ring-1 focus:ring-theme-primary font-mono transition-colors duration-150 ease-linear"
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
                  <FormLabel className="text-theme-secondary font-mono uppercase text-xs tracking-wider">Slug</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="acme-inc"
                      {...field}
                      disabled={!isAdmin || isSaving}
                      className="bg-theme-bg-elevated border-theme-border-base text-theme-foreground placeholder:text-theme-muted focus:border-theme-primary focus:ring-1 focus:ring-theme-primary font-mono transition-colors duration-150 ease-linear"
                    />
                  </FormControl>
                  <FormMessage className="text-theme-error font-mono text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="logo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-theme-secondary font-mono uppercase text-xs tracking-wider">Logo URL (optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/logo.png"
                      {...field}
                      disabled={!isAdmin || isSaving}
                      className="bg-theme-bg-elevated border-theme-border-base text-theme-foreground placeholder:text-theme-muted focus:border-theme-primary focus:ring-1 focus:ring-theme-primary font-mono transition-colors duration-150 ease-linear"
                    />
                  </FormControl>
                  <FormMessage className="text-theme-error font-mono text-xs" />
                </FormItem>
              )}
            />

            {isAdmin && (
              <div className="flex justify-between items-center pt-4 border-t border-theme-border-base">
                <div className="flex flex-col gap-1">
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setShowDeleteDialog(true)}
                    disabled={isSaving || isOnlyOrganization}
                    className="bg-theme-error hover:bg-theme-error/90 text-theme-inverted font-mono uppercase text-xs tracking-wider transition-colors duration-150 ease-linear disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                  {isOnlyOrganization && (
                    <p className="text-xs text-theme-muted font-mono">
                      Cannot delete your only organization
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-theme-primary text-theme-inverted hover:bg-theme-primary/90 font-mono uppercase text-xs tracking-wider transition-colors duration-150 ease-linear"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </form>
        </Form>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-theme-bg-elevated border-theme-border-base text-theme-foreground font-mono">
          <DialogHeader>
            <DialogTitle className="text-theme-foreground font-mono uppercase tracking-wider">Delete Organization</DialogTitle>
            <DialogDescription className="text-theme-secondary font-mono">
              Are you sure you want to delete this organization? This action
              cannot be undone and will remove all members and data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
              className="bg-transparent hover:bg-theme-bg-hover border-theme-border-base text-theme-foreground font-mono uppercase text-xs tracking-wider transition-colors duration-150 ease-linear"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-theme-error hover:bg-theme-error/90 text-theme-inverted font-mono uppercase text-xs tracking-wider transition-colors duration-150 ease-linear"
            >
              {isDeleting ? "Deleting..." : "Delete Organization"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
