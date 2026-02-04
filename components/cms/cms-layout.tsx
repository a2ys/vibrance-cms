"use client";

import React from "react";
import { Sidebar } from "./sidebar";

interface CMSLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function CMSLayout({
  children,
  title,
  description,
  actions,
}: CMSLayoutProps) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <Sidebar />
      <main className="pl-64">
        <header className="sticky top-0 z-40 border-b border-border bg-zinc-50/95 backdrop-blur supports-backdrop-filter:bg-zinc-50/60">
          <div className="flex h-14 items-center justify-between px-4">
            <div>
              <h1 className="text-lg font-semibold text-foreground leading-tight">
                {title}
              </h1>
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
            </div>
            {actions && (
              <div className="flex items-center gap-2">{actions}</div>
            )}
          </div>
        </header>
        <div className="p-4">{children}</div>
      </main>
    </div>
  );
}
