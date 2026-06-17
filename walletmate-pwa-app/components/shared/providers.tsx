"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { I18nProvider } from "@/lib/i18n";
import { ConfirmDialogProvider } from "@/components/ui/confirm-dialog";

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 0,
        refetchOnMount: "always",
        refetchOnWindowFocus: "always",
        refetchOnReconnect: "always",
        retry: 1,
      },
    },
  });
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <SessionProvider>
        <I18nProvider>
          <QueryClientProvider client={queryClient}>
            <ConfirmDialogProvider>{children}</ConfirmDialogProvider>
          </QueryClientProvider>
        </I18nProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
