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
import { formatDate } from "@/lib/utils";

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
        setEvents(Array.isArray(data) ? data : []);
      } catch {
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  const stats = useMemo(() => {
    const totalEvents = events.length;
    const eventsWithMedia = events.filter((e) => e.poster_path).length;

    return [
      {
        title: "Total Events",
        value: totalEvents,
        icon: CalendarBlankIcon,
        description: "Events in database",
      },
      {
        title: "With Media",
        value: eventsWithMedia,
        icon: ImageSquareIcon,
        description: "Events with posters",
      },
    ];
  }, [events]);

  const recentEvents = useMemo(() => {
    return events.slice(0, 5);
  }, [events]);

  return (
    <CMSLayout title="Dashboard" description="Overview of the CMS">
      <div className="space-y-4 bg-zinc-50 p-4">
        <div className="grid gap-4 md:grid-cols-2">
          {stats.map((stat) => (
            <Card key={stat.title} className={CARD_CLASS}>
              <CardHeader className="flex flex-row items-center justify-between p-4 pb-2 space-y-0">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
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
          <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-100 p-4">
            <div className="space-y-1">
              <CardTitle className="text-base font-medium">
                Recent Events
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Your latest events at a glance
              </p>
            </div>
            <Link href="/events" className="cursor-pointer">
              <Button
                variant="outline"
                size="sm"
                className="rounded-none bg-zinc-50 hover:bg-zinc-100 border-zinc-200 h-8 text-xs px-3 cursor-pointer"
              >
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="divide-y divide-zinc-50">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-3">
                    <Skeleton className="h-10 w-10" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No events added yet
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  <Link href="/events/import" className="cursor-pointer">
                    <Button
                      className="rounded-none h-8 text-xs cursor-pointer px-3"
                      variant="outline"
                    >
                      <UploadSimpleIcon className="mr-1.5 h-4 w-4" />
                      Upload Events from CSV
                    </Button>
                  </Link>
                  <Link href="/events/new" className="cursor-pointer">
                    <Button
                      size="sm"
                      className="rounded-none h-8 text-xs cursor-pointer"
                    >
                      Create an Event
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {recentEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-4 p-3 hover:bg-zinc-50 transition-colors group"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden border border-zinc-200 bg-white rounded-none">
                      {event.poster_path ? (
                        <img
                          src={`${API_URL}/${event.poster_path}`}
                          alt={event.event_name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <CalendarBlankIcon className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate text-sm group-hover:text-zinc-900">
                        {event.event_name}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                        <ClockIcon className="h-3.5 w-3.5" />
                        {formatDate(event.start_date_time)}
                      </div>
                    </div>

                    <Link
                      href={`/events/${event.id}`}
                      className="cursor-pointer"
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-none hover:bg-white hover:border-zinc-300 border border-transparent h-8 text-xs px-3 cursor-pointer text-muted-foreground hover:text-foreground"
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
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base font-medium">
              Quick Actions
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Common tasks you can perform
            </p>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="grid gap-3 sm:grid-cols-4">
              {[
                {
                  href: "/events/new",
                  icon: CalendarBlankIcon,
                  title: "Create Event",
                  desc: "Add a new event",
                },
                {
                  href: "/events/import",
                  icon: UploadSimpleIcon,
                  title: "Import Events",
                  desc: "Bulk upload events",
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
                  desc: "Add new media",
                },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="block group cursor-pointer"
                >
                  <div className="flex items-center gap-3 border border-zinc-200 bg-zinc-50 p-3 transition-all hover:bg-zinc-100 hover:border-zinc-300 rounded-none h-full cursor-pointer">
                    <div className="h-8 w-8 flex items-center justify-center bg-white border border-zinc-200 shrink-0">
                      <action.icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">
                        {action.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
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
