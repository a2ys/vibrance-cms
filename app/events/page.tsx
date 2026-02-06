"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { CMSLayout } from "@/components/cms/cms-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { API_URL } from "@/lib/config";
import type { Event } from "@/lib/types";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import {
  EyeIcon,
  ImageIcon,
  PlusIcon,
  TrashIcon,
  PencilSimpleIcon,
  MagnifyingGlassIcon,
  CalendarBlankIcon,
  MapPinIcon,
} from "@phosphor-icons/react";

function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse bg-zinc-200 ${className}`} />;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const debouncedQuery = useDebounce(searchQuery, 300);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/events`);
      const data = await res.json();
      setEvents(data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleDelete = useCallback(async () => {
    if (!deleteId) return;
    try {
      await fetch(`${API_URL}/events/${deleteId}`, { method: "DELETE" });
      fetchEvents();
    } catch {}
    setDeleteId(null);
  }, [deleteId, fetchEvents]);

  const filteredEvents = useMemo(() => {
    if (!debouncedQuery) return events;
    const lowerQuery = debouncedQuery.toLowerCase();
    return events.filter(
      (event) =>
        event.event_name.toLowerCase().includes(lowerQuery) ||
        event.short_description?.toLowerCase().includes(lowerQuery) ||
        event.club_name?.toLowerCase().includes(lowerQuery),
    );
  }, [events, debouncedQuery]);

  return (
    <CMSLayout
      title="Events"
      description="Manage your club events and activities"
      actions={
        <Link href="/events/new" className="cursor-pointer">
          <Button className="rounded-none h-8 text-sm cursor-pointer px-3">
            <PlusIcon className="mr-1.5 h-4 w-4" />
            Create Event
          </Button>
        </Link>
      }
    >
      <div className="bg-zinc-50 space-y-2">
        <div className="relative w-full max-w-sm">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm rounded-none bg-white border-zinc-300 focus:border-zinc-800 focus:ring-0 w-full"
          />
        </div>

        {loading ? (
          <div className="space-y-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card
                key={i}
                className="rounded-none border-zinc-200 bg-white shadow-sm p-0"
              >
                <CardContent className="flex items-center gap-3 p-3">
                  <Skeleton className="h-12 w-12 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <Card className="rounded-none border-zinc-200 bg-white shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <h3 className="mt-1 font-medium text-foreground text-sm">
                {searchQuery ? "No events found" : "No events yet"}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {searchQuery
                  ? "Try adjusting your search query"
                  : "Create your first event to get started"}
              </p>
              {!searchQuery && (
                <Link href="/events/new" className="mt-3 cursor-pointer">
                  <Button className="rounded-none h-8 text-xs cursor-pointer">
                    <PlusIcon className="mr-1.5 h-3.5 w-3.5" />
                    Create Event
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-1">
            {filteredEvents.map((event) => (
              <Card
                key={event.id}
                className="rounded-none border-zinc-200 bg-white shadow-sm transition-all hover:border-zinc-300 hover:bg-zinc-50 p-0 group"
              >
                <CardContent className="flex items-center gap-3 p-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-none border border-zinc-200 bg-zinc-50">
                    {event.poster_path ? (
                      <img
                        src={`${API_URL}/${event.poster_path}`}
                        alt={event.event_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-foreground truncate text-sm group-hover:text-zinc-900">
                        {event.event_name}
                      </h3>
                      {(event.is_special_event === true ||
                        event.is_special_event === 1) && (
                        <span className="inline-flex items-center rounded-none bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 border border-amber-100 shrink-0">
                          Special
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1.5">
                        <CalendarBlankIcon className="h-3.5 w-3.5" />
                        {event.start_date_time}
                      </span>
                      {event.event_venue && (
                        <span className="flex items-center gap-1.5">
                          <MapPinIcon className="h-3.5 w-3.5" />
                          {event.event_venue}
                        </span>
                      )}
                      {event.club_name && (
                        <span className="font-medium text-zinc-500">
                          • {event.club_name}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Link
                      href={`/events/${event.id}`}
                      className="cursor-pointer"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-none hover:bg-white hover:border-zinc-200 border border-transparent text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link
                      href={`/events/${event.id}/edit`}
                      className="cursor-pointer"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-none hover:bg-white hover:border-zinc-200 border border-transparent text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <PencilSimpleIcon className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(event.id)}
                      className="h-8 w-8 rounded-none text-muted-foreground hover:text-red-600 hover:bg-red-50 border border-transparent cursor-pointer"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <AlertDialog
          open={deleteId !== null}
          onOpenChange={() => setDeleteId(null)}
        >
          <AlertDialogContent className="rounded-none border-zinc-200 bg-white p-5 w-[95vw] max-w-sm">
            <AlertDialogHeader className="space-y-2">
              <AlertDialogTitle className="text-base">
                Delete Event
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm">
                Are you sure you want to delete this event? This will also
                remove the associated poster from storage.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-5">
              <AlertDialogCancel className="rounded-none border-zinc-200 bg-white hover:bg-zinc-50 h-8 text-sm cursor-pointer">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="rounded-none bg-red-600 text-white hover:bg-red-700 h-8 text-sm border border-red-700 cursor-pointer"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </CMSLayout>
  );
}
