"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import {
  HouseIcon,
  CalendarBlankIcon,
  FolderOpenIcon,
  UploadSimpleIcon,
  SignOutIcon,
  SidebarSimpleIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "/", icon: HouseIcon },
  { name: "Events", href: "/events", icon: CalendarBlankIcon },
  { name: "Media Browser", href: "/media", icon: FolderOpenIcon },
  { name: "Upload Media", href: "/upload", icon: UploadSimpleIcon },
];

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

export function Sidebar({ isCollapsed, toggleSidebar }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "relative z-50 border-r border-zinc-200 bg-white flex flex-col transition-all duration-300 ease-in-out",
        isCollapsed ? "w-17.5" : "w-64",
      )}
    >
      <div
        className={cn(
          "flex h-12 shrink-0 items-center px-3 border-b border-zinc-200 transition-all",
          isCollapsed ? "justify-center" : "justify-between",
        )}
      >
        <div
          className={cn(
            "flex items-center gap-2 overflow-hidden transition-all",
            isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100 flex",
          )}
        >
          <div className="h-5 w-5 bg-foreground rounded-none shrink-0"></div>
          <span className="text-sm font-bold tracking-tight text-foreground whitespace-nowrap">
            Vibrance CMS
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-8 w-8 rounded-none text-muted-foreground hover:text-foreground shrink-0"
        >
          <SidebarSimpleIcon className="h-4 w-4" />
        </Button>
      </div>

      <nav className="flex-1 flex flex-col gap-1 p-2 overflow-y-auto overflow-x-hidden">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              title={isCollapsed ? item.name : undefined}
              className={cn(
                "flex items-center rounded-none py-2 text-xs font-medium transition-all border-l-2 cursor-pointer whitespace-nowrap",
                isCollapsed
                  ? "justify-center px-0"
                  : "justify-start gap-3 px-3",
                isActive
                  ? "bg-zinc-100 text-foreground border-foreground"
                  : "text-muted-foreground hover:bg-zinc-50 hover:text-foreground border-transparent",
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span
                className={cn(
                  "transition-all duration-300",
                  isCollapsed
                    ? "w-0 opacity-0 overflow-hidden hidden"
                    : "w-auto opacity-100 block",
                )}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t border-zinc-200 bg-white">
        <SignOutButton redirectUrl="/sign-in">
          <button
            title="Sign Out"
            className={cn(
              "flex w-full items-center rounded-none py-2 text-xs font-medium transition-all border-l-2 border-transparent",
              "text-muted-foreground hover:bg-red-50 hover:text-red-600 hover:border-red-600",
              "cursor-pointer",
              isCollapsed ? "justify-center px-0" : "justify-start gap-3 px-3",
            )}
          >
            <SignOutIcon className="h-4 w-4 shrink-0" />
            <span
              className={cn(
                "transition-all duration-300",
                isCollapsed
                  ? "w-0 opacity-0 overflow-hidden hidden"
                  : "w-auto opacity-100 block",
              )}
            >
              Sign Out
            </span>
          </button>
        </SignOutButton>
      </div>
    </aside>
  );
}
