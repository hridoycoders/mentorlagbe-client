import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import Providers from "@/components/providers";
import RoleBasedAppLayout from "@/components/layout/RoleBasedAppLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MentorLagbe | Find Your Perfect Tutor",
  description:
    "Connect with expert tutors and find the right guidance for your learning journey.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}
      >
        <Providers>
          <Suspense
            fallback={
              <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="animate-spin rounded-full border-4 border-primary border-t-transparent size-8" />
              </div>
            }
          >
            <RoleBasedAppLayout>{children}</RoleBasedAppLayout>
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
