"use client";

import { useEffect, useState, useMemo } from "react";
import { CMSLayout } from "@/components/cms/cms-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { API_URL } from "@/lib/config";
import type { Event } from "@/lib/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  CalendarBlankIcon,
  ClockIcon,
  ImageSquareIcon,
  UploadSimpleIcon,
} from "@phosphor-icons/react";

const CARD_CLASS = "rounded-none border-zinc-200 bg-white shadow-sm";

function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse bg-zinc-200 ${className}`} />;
}

export default function DashboardPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch(`${API_URL}/events`);
        const data = await res.json();
        setEvents(data || []);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  const stats = useMemo(() => {
    const totalEvents = events.length;
    const eventsWithImages = events.filter((e) => e.image_path).length;

    return [
      {
        title: "Total Events",
        value: totalEvents,
        icon: CalendarBlankIcon,
        description: "Events in database",
      },
      {
        title: "With Posters",
        value: eventsWithImages,
        icon: ImageSquareIcon,
        description: "Events with poster images",
      },
    ];
  }, [events]);

  const recentEvents = useMemo(() => {
    return events.slice(0, 5);
  }, [events]);

  return (
    <CMSLayout
      title="Dashboard"
      description="Overview of your content management system"
    >
      <div className="space-y-4 bg-zinc-50 min-h-screen p-4">
        <div className="grid gap-3 md:grid-cols-2">
          {stats.map((stat) => (
            <Card key={stat.title} className={CARD_CLASS}>
              <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pt-2">
                {loading ? (
                  <Skeleton className="h-8 w-16 mb-1" />
                ) : (
                  <div className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className={CARD_CLASS}>
          <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-100 pb-3 pt-4 px-4">
            <div>
              <CardTitle className="text-base">Recent Events</CardTitle>
              <p className="text-xs text-muted-foreground">
                Your latest events at a glance
              </p>
            </div>
            <Link href="/events" className="cursor-pointer">
              <Button
                variant="outline"
                size="sm"
                className="rounded-none bg-zinc-50 hover:bg-zinc-100 border-zinc-200 h-8 text-xs cursor-pointer"
              >
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-3 px-3 pb-3">
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 border border-zinc-100 p-2"
                  >
                    <Skeleton className="h-10 w-10" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-3/4" />
                      <Skeleton className="h-2 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <p className="mt-1 text-sm text-muted-foreground">
                  No events yet
                </p>
                <Link href="/events/new" className="mt-3 cursor-pointer">
                  <Button
                    size="sm"
                    className="rounded-none h-8 text-xs cursor-pointer"
                  >
                    Create Your First Event
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {recentEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-3 border border-zinc-200 bg-zinc-50/50 p-2 rounded-none transition-colors hover:bg-zinc-50"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden border border-zinc-200 bg-white rounded-none">
                      {event.image_path ? (
                        <img
                          src={`${API_URL}/${event.image_path}`}
                          alt={event.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <CalendarBlankIcon className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate text-sm">
                        {event.title}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider">
                        <ClockIcon className="h-3 w-3" />
                        {event.date}
                      </div>
                    </div>
                    <Link
                      href={`/events/${event.id}`}
                      className="cursor-pointer"
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-none hover:bg-white hover:border-zinc-300 border border-transparent h-7 text-xs px-2 cursor-pointer"
                      >
                        View
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className={CARD_CLASS}>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-base">Quick Actions</CardTitle>
            <p className="text-xs text-muted-foreground">
              Common tasks you can perform
            </p>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="grid gap-2 sm:grid-cols-3">
              {[
                {
                  href: "/events/new",
                  icon: CalendarBlankIcon,
                  title: "Create Event",
                  desc: "Add a new event",
                },
                {
                  href: "/media",
                  icon: ImageSquareIcon,
                  title: "Browse Media",
                  desc: "View all assets",
                },
                {
                  href: "/upload",
                  icon: UploadSimpleIcon,
                  title: "Upload Media",
                  desc: "Add photos or videos",
                },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="block group cursor-pointer"
                >
                  <div className="flex items-center gap-3 border border-zinc-200 bg-zinc-50 p-3 transition-all hover:bg-zinc-100 hover:border-zinc-300 rounded-none h-full cursor-pointer">
                    <action.icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground shrink-0" />
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        {action.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {action.desc}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </CMSLayout>
  );
}
