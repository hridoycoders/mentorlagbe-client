"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      storageKey="mentorlagbe-theme"
      disableTransitionOnChange
    >
      {children}
      <Toaster position="top-right" richColors closeButton theme="system" />
    </ThemeProvider>
  );
}
