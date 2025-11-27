"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";

function Header() {
  const { data: session, isPending } = authClient.useSession();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-white">
            Mastra
          </Link>

          <div className="flex items-center gap-3">
            {isPending ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : session?.user ? (
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm font-medium bg-white text-gray-900 hover:bg-white/90 rounded-lg transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="px-4 py-2 text-sm font-medium text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 text-sm font-medium bg-white text-gray-900 hover:bg-white/90 rounded-lg transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900">
      <Header />

      <main className="pt-16">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
              Build AI Agents with
              <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Mastra & CopilotKit
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
              A powerful starter template for building AI-native applications. Combine backend AI capabilities with frontend conversational UI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="px-8 py-4 text-lg font-medium bg-white text-gray-900 hover:bg-white/90 rounded-xl transition-all transform hover:scale-105 shadow-lg"
              >
                Get Started Free
              </Link>
              <Link
                href="/signin"
                className="px-8 py-4 text-lg font-medium bg-white/10 text-white hover:bg-white/20 rounded-xl transition-all backdrop-blur-sm border border-white/20"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-gray-300">
              Built on modern tools and best practices
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon="🤖"
              title="AI Agents"
              description="Build intelligent agents with Mastra's powerful framework. Define tools, memory, and instructions."
            />
            <FeatureCard
              icon="💬"
              title="Conversational UI"
              description="CopilotKit provides beautiful chat interfaces with shared state between frontend and agents."
            />
            <FeatureCard
              icon="🔐"
              title="Authentication"
              description="Production-ready authentication with Better Auth. Email, OAuth, and more out of the box."
            />
            <FeatureCard
              icon="⚡"
              title="Cloudflare D1"
              description="Serverless SQL database for persistent storage. Fast, scalable, and globally distributed."
            />
            <FeatureCard
              icon="🎨"
              title="Generative UI"
              description="Render custom UI components when agents call tools. Create rich, interactive experiences."
            />
            <FeatureCard
              icon="🚀"
              title="Deploy Anywhere"
              description="Built with Next.js. Deploy to Cloudflare Workers, Vercel, or any Node.js host."
            />
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 border border-white/20 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Build?
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Start creating AI-powered applications today. Sign up to get access to the dashboard and start building with our agents.
            </p>
            <Link
              href="/signup"
              className="inline-block px-8 py-4 text-lg font-medium bg-white text-gray-900 hover:bg-white/90 rounded-xl transition-all transform hover:scale-105 shadow-lg"
            >
              Create Your Account
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-white/10">
          <div className="text-center text-gray-400">
            <p>Built with Mastra, CopilotKit, and Next.js</p>
          </div>
        </footer>
      </main>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  );
}
