"use client";

import { useEffect, useState } from "react";
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
  VideoIcon,
} from "@phosphor-icons/react";

const CARD_CLASS = "rounded-none border-border";

export default function DashboardPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // ... (Fetch logic remains the same) ...
  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch(`${API_URL}/events`);
        const data = await res.json();
        setEvents(data || []);
      } catch (error) {
        console.log("[v0] Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  const totalEvents = events.length;
  const eventsWithImages = events.filter(
    (e) => e.image_path && !e.image_path.includes("video"),
  ).length;
  const eventsWithVideos = events.filter((e) =>
    e.image_path?.includes("video"),
  ).length;
  const recentEvents = events.slice(0, 5);

  // ... (Stats array remains the same) ...
  const stats = [
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
    {
      title: "With Videos",
      value: eventsWithVideos,
      icon: VideoIcon,
      description: "Events with video content",
    },
  ];

  return (
    <CMSLayout
      title="Dashboard"
      description="Overview of your content management system"
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <Card key={stat.title} className={CARD_CLASS}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {loading ? "-" : stat.value}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className={CARD_CLASS}>
          <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-100 pb-4">
            <div>
              <CardTitle>Recent Events</CardTitle>
              <p className="text-sm text-muted-foreground">
                Your latest events at a glance
              </p>
            </div>
            <Link href="/events">
              <Button
                variant="outline"
                size="sm"
                className="rounded-none bg-zinc-50 hover:bg-zinc-100"
              >
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : recentEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CalendarBlankIcon className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No events yet
                </p>
                <Link href="/events/new" className="mt-4">
                  <Button size="sm" className="rounded-none">
                    Create Your First Event
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-4 border border-zinc-200 bg-zinc-50/50 p-3 rounded-none transition-colors hover:bg-zinc-50"
                  >
                    <div className="flex h-12 w-12 items-center justify-center bg-white border border-zinc-200 rounded-none">
                      {event.image_path ? (
                        event.image_path.includes("video") ? (
                          <VideoIcon className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ImageSquareIcon className="h-5 w-5 text-muted-foreground" />
                        )
                      ) : (
                        <CalendarBlankIcon className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {event.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <ClockIcon className="h-3 w-3" />
                        {event.date}
                      </div>
                    </div>
                    <Link href={`/events/${event.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-none hover:bg-white hover:border-zinc-300 border border-transparent"
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

        {/* Quick Actions */}
        <Card className="rounded-none border-border bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <p className="text-sm text-muted-foreground">
              Common tasks you can perform
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
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
                  icon: VideoIcon,
                  title: "Upload Media",
                  desc: "Add photos or videos",
                },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="block group"
                >
                  <div className="flex items-center gap-3 border border-border bg-zinc-50 p-4 transition-all hover:bg-zinc-100 hover:border-zinc-300 rounded-none">
                    <action.icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
                    <div>
                      <p className="font-medium text-foreground">
                        {action.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
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
