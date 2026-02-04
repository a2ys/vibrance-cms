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
        event.title.toLowerCase().includes(lowerQuery) ||
        event.description?.toLowerCase().includes(lowerQuery),
    );
  }, [events, debouncedQuery]);

  return (
    <CMSLayout
      title="Events"
      description="Manage all your events"
      actions={
        <Link href="/events/new" className="cursor-pointer">
          <Button className="rounded-none h-8 text-xs cursor-pointer">
            <PlusIcon className="mr-2 h-3 w-3" />
            Create Event
          </Button>
        </Link>
      }
    >
      <div className="bg-zinc-50 min-h-screen space-y-4">
        <div className="relative max-w-sm">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm rounded-none bg-white border-zinc-300 focus:border-zinc-800 focus:ring-0"
          />
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card
                key={i}
                className="rounded-none border-zinc-200 bg-white shadow-sm gap-0 py-0"
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
          <Card className="rounded-none border-zinc-200 bg-white shadow-sm gap-0 py-0">
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <h3 className="mt-2 font-medium text-foreground text-sm">
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
                    <PlusIcon className="mr-2 h-3 w-3" />
                    Create Event
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredEvents.map((event) => (
              <Card
                key={event.id}
                className="rounded-none border-zinc-200 bg-white shadow-sm transition-all hover:border-zinc-300 hover:shadow-md gap-0 py-0"
              >
                <CardContent className="flex items-center gap-3 p-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-none border border-zinc-200 bg-zinc-50">
                    {event.image_path ? (
                      <img
                        src={`${API_URL}/${event.image_path}`}
                        alt={event.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate text-sm">
                      {event.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {event.date}
                    </p>
                    {event.description && (
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                        {event.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <Link
                      href={`/events/${event.id}`}
                      className="cursor-pointer"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-none hover:bg-zinc-100 hover:border-zinc-300 border border-transparent cursor-pointer"
                      >
                        <EyeIcon className="h-3.5 w-3.5" />
                        <span className="sr-only">View</span>
                      </Button>
                    </Link>
                    <Link
                      href={`/events/${event.id}/edit`}
                      className="cursor-pointer"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-none hover:bg-zinc-100 hover:border-zinc-300 border border-transparent cursor-pointer"
                      >
                        <PencilSimpleIcon className="h-3.5 w-3.5" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(event.id)}
                      className="h-7 w-7 rounded-none text-destructive hover:text-destructive hover:bg-red-50 hover:border-red-100 border border-transparent cursor-pointer"
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                      <span className="sr-only">Delete</span>
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
          <AlertDialogContent className="rounded-none border-zinc-200 bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Event</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this event? This will also
                remove the associated media from storage. This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-none border-zinc-200 bg-white hover:bg-zinc-50 cursor-pointer">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="rounded-none bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
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
