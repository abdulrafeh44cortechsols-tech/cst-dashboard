"use client";
import type React from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Suspense, useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { LeftSidebar } from "@/components/sidebar";
import { useAuthContext } from "@/components/auth-provider";
import { AuthenticatedRoute } from "@/components/RouteGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());
  const { logout } = useAuthContext();

  return (
    <AuthenticatedRoute>
      <QueryClientProvider client={queryClient}>
        <SidebarProvider defaultOpen={true}>
          <LeftSidebar />
          <SidebarInset>
            <Suspense fallback={<div>Loading...</div>}>
              <header className="flex h-14 lg:h-[60px] items-center justify-between gap-4 border-b bg-muted/40 px-6">
                
                {/* SidebarTrigger is now always visible */}
                <SidebarTrigger />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full  border w-8 h-8 "
                    >
                      A<span className="sr-only">Toggle user menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </header>
              <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                {children}
              </main>
            </Suspense>
          </SidebarInset>
        </SidebarProvider>
      </QueryClientProvider>
    </AuthenticatedRoute>
  );
}
