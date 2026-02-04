"use client";

import { useEffect, useState } from "react";
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

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API_URL}/events`);
      const data = await res.json();
      setEvents(data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await fetch(`${API_URL}/events/${deleteId}`, { method: "DELETE" });
      fetchEvents();
    } catch {}
    setDeleteId(null);
  };

  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <CMSLayout
      title="Events"
      description="Manage all your events"
      actions={
        <Link href="/events/new">
          <Button className="rounded-none">
            <PlusIcon className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </Link>
      }
    >
      <div className="bg-zinc-50 min-h-screen space-y-6">
        <div className="relative max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 rounded-none bg-white border-zinc-300 focus:border-zinc-800 focus:ring-0"
          />
        </div>

        {loading ? (
          <Card className="rounded-none border-zinc-200 bg-white shadow-sm gap-0 py-0">
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">Loading events...</p>
            </CardContent>
          </Card>
        ) : filteredEvents.length === 0 ? (
          <Card className="rounded-none border-zinc-200 bg-white shadow-sm gap-0 py-0">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <h3 className="mt-4 font-medium text-foreground">
                {searchQuery ? "No events found" : "No events yet"}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchQuery
                  ? "Try adjusting your search query"
                  : "Create your first event to get started"}
              </p>
              {!searchQuery && (
                <Link href="/events/new" className="mt-4">
                  <Button className="rounded-none">
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Create Event
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredEvents.map((event) => (
              <Card
                key={event.id}
                className="rounded-none border-zinc-200 bg-white shadow-sm transition-all hover:border-zinc-300 hover:shadow-md  gap-0 py-0"
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-none border border-zinc-200 bg-zinc-50">
                    {event.image_path ? (
                      <img
                        src={`${API_URL}/${event.image_path}`}
                        alt={event.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">
                      {event.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {event.date}
                    </p>
                    {event.description && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                        {event.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/events/${event.id}`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-none hover:bg-zinc-100 hover:border-zinc-300 border border-transparent"
                      >
                        <EyeIcon className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                    </Link>
                    <Link href={`/events/${event.id}/edit`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-none hover:bg-zinc-100 hover:border-zinc-300 border border-transparent"
                      >
                        <PencilSimpleIcon className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(event.id)}
                      className="rounded-none text-destructive hover:text-destructive hover:bg-red-50 hover:border-red-100 border border-transparent"
                    >
                      <TrashIcon className="h-4 w-4" />
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
              <AlertDialogCancel className="rounded-none border-zinc-200 bg-white hover:bg-zinc-50">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="rounded-none bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
