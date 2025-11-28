"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Building2, Loader2 } from "lucide-react";

const createOrgSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  slug: z.string().optional(),
  logo: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type CreateOrgFormValues = z.infer<typeof createOrgSchema>;

export default function CreateOrganizationPage() {
  const [isCreating, setIsCreating] = useState(false);

  const form = useForm<CreateOrgFormValues>({
    resolver: zodResolver(createOrgSchema),
    defaultValues: {
      name: "",
      slug: "",
      logo: "",
    },
  });

  const onSubmit = async (data: CreateOrgFormValues) => {
    try {
      setIsCreating(true);

      const response = await fetch("/api/organization", {
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

      const org = (await response.json()) as {
        id: string;
        name: string;
        slug: string;
        logo: string | null;
        role: string;
        createdAt: string;
      };

      // Switch to the newly created organization
      const switchResponse = await fetch("/api/organization/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId: org.id }),
      });

      if (!switchResponse.ok) {
        const errorData = (await switchResponse.json()) as { error?: string };
        throw new Error(
          errorData.error || "Failed to switch to organization"
        );
      }

      toast.success("Organization created successfully");

      // Full page redirect with reload
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Error creating organization:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create organization"
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-theme-bg-base py-12 px-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-theme-bg-card rounded-full">
              <Building2 className="size-12 text-theme-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-theme-foreground font-mono uppercase tracking-wider">
            Create Organization
          </h1>
          <p className="text-theme-secondary mt-2 font-mono text-sm">
            Set up your first organization to get started
          </p>
        </div>

        <div className="border border-theme-border-base rounded-lg p-8 bg-theme-bg-elevated">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    "Create Organization"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
