"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { AuthGuard } from "@/components/auth-guard";
import { CommandPalette } from "@/components/command-palette";
import { NotificationsProvider } from "@/components/notifications-panel";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <NotificationsProvider>
        <div className="flex h-screen bg-background text-foreground">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto">
              <div className="max-w-[1400px] mx-auto p-6 animate-fade-up">
                {children}
              </div>
            </main>
          </div>
          <CommandPalette />
        </div>
      </NotificationsProvider>
    </AuthGuard>
  );
}
