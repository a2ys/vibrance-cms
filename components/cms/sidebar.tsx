"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  HouseIcon,
  CalendarBlankIcon,
  FolderOpenIcon,
  UploadSimpleIcon,
} from "@phosphor-icons/react";

const navigation = [
  { name: "Dashboard", href: "/", icon: HouseIcon },
  { name: "Events", href: "/events", icon: CalendarBlankIcon },
  { name: "Media Browser", href: "/media", icon: FolderOpenIcon },
  { name: "Upload Media", href: "/upload", icon: UploadSimpleIcon },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-zinc-200 bg-white">
      <div className="flex h-16 items-center border-b border-zinc-200 px-6">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 bg-foreground rounded-none"></div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            Vibrance CMS
          </span>
        </div>
      </div>
      <nav className="flex flex-col gap-1 p-4">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-none px-3 py-2 text-sm font-medium transition-all border-l-2",
                isActive
                  ? "bg-zinc-100 text-foreground border-foreground"
                  : "text-muted-foreground hover:bg-zinc-50 hover:text-foreground border-transparent",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
