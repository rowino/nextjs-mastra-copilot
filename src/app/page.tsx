import Link from "next/link";
import { Button } from "@/app/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted/20">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-8 text-center">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              Build AI Agents with Mastra
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground text-lg sm:text-xl">
              A starter template for building intelligent AI agents using Mastra and CopilotKit with Next.js
            </p>
          </div>
          <div className="space-x-4">
            <Button asChild size="lg">
              <Link href="/auth/login">
                Get Started
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/dashboard">
                View Demo
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
