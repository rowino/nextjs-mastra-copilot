"use client";

import { Geist, Geist_Mono } from "next/font/google";
import { CopilotKit } from "@copilotkit/react-core";
import { AuthUIProvider } from "@daveyplate/better-auth-ui";
import { authClient } from "@/lib/auth/client";
import "@copilotkit/react-ui/styles.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthUIProvider authClient={authClient}>
          <CopilotKit publicLicenseKey={process.env.NEXT_PUBLIC_COPILOTKIT_PUBLIC_KEY} runtimeUrl="/api/copilotkit" agent="weatherAgent">
            {children}
          </CopilotKit>
        </AuthUIProvider>
      </body>
    </html>
  );
}
