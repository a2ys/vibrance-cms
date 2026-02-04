"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { CMSLayout } from "@/components/cms/cms-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeftIcon,
  PencilSimpleIcon,
  TrashIcon,
  CalendarBlankIcon,
  ImageIcon,
  VideoIcon,
} from "@phosphor-icons/react";
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

function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse bg-zinc-200 ${className}`} />;
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch(`${API_URL}/events`);
        const data = await res.json();
        const foundEvent = data.find((e: Event) => e.id === Number(params.id));
        setEvent(foundEvent || null);
      } catch {
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [params.id]);

  const handleDelete = useCallback(async () => {
    if (!event) return;
    try {
      await fetch(`${API_URL}/events/${event.id}`, { method: "DELETE" });
      router.push("/events");
    } catch {}
  }, [event, router]);

  if (loading) {
    return (
      <CMSLayout title="Loading..." description="Please wait">
        <div className="grid gap-4 lg:grid-cols-2 bg-zinc-50 min-h-screen">
          <Card className="rounded-none border-zinc-200 bg-white shadow-sm h-fit">
            <CardHeader className="border-b border-zinc-100 pb-3 pt-4 px-4">
              <Skeleton className="h-5 w-24" />
            </CardHeader>
            <CardContent className="pt-4 px-4 pb-4">
              <Skeleton className="aspect-video w-full" />
            </CardContent>
          </Card>
          <Card className="rounded-none border-zinc-200 bg-white shadow-sm h-fit">
            <CardHeader className="border-b border-zinc-100 pb-3 pt-4 px-4">
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="space-y-4 pt-4 px-4 pb-4">
              <div className="space-y-1">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-6 w-3/4" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-5 w-1/3" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-24 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </CMSLayout>
    );
  }

  if (!event) {
    return (
      <CMSLayout title="Event Not Found" description="The event does not exist">
        <Card className="rounded-none border-zinc-200 bg-white shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <h3 className="mt-4 font-medium text-foreground">
              Event not found
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              The event you are looking for does not exist or has been deleted.
            </p>
            <Link href="/events" className="mt-4 cursor-pointer">
              <Button className="rounded-none cursor-pointer">
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Back to Events
              </Button>
            </Link>
          </CardContent>
        </Card>
      </CMSLayout>
    );
  }

  const isVideo = event.image_path?.includes("video");

  return (
    <CMSLayout
      title={event.title}
      description={`Event on ${event.date}`}
      actions={
        <div className="flex items-center gap-2">
          <Link href="/events" className="cursor-pointer">
            <Button
              variant="outline"
              className="rounded-none bg-white hover:bg-zinc-50 border-zinc-200 h-8 text-xs cursor-pointer"
            >
              <ArrowLeftIcon className="mr-2 h-3.5 w-3.5" />
              Back
            </Button>
          </Link>
          <Link href={`/events/${event.id}/edit`} className="cursor-pointer">
            <Button
              variant="outline"
              className="rounded-none bg-white hover:bg-zinc-50 border-zinc-200 h-8 text-xs cursor-pointer"
            >
              <PencilSimpleIcon className="mr-2 h-3.5 w-3.5" />
              Edit
            </Button>
          </Link>
          <Button
            onClick={() => setShowDeleteDialog(true)}
            variant="destructive"
            className="rounded-none h-8 text-xs cursor-pointer"
          >
            <TrashIcon className="mr-2 h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 lg:grid-cols-2 bg-zinc-50 min-h-screen">
        <Card className="rounded-none border-zinc-200 bg-white shadow-sm h-fit">
          <CardHeader className="border-b border-zinc-100 pb-3 pt-4 px-4">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              {isVideo ? (
                <>
                  <VideoIcon className="h-4 w-4" /> Video
                </>
              ) : (
                <>
                  <ImageIcon className="h-4 w-4" /> Poster
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 px-4 pb-4">
            {event.image_path ? (
              isVideo ? (
                <div className="flex aspect-video items-center justify-center bg-zinc-100 border border-zinc-200 rounded-none">
                  <video
                    src={`${API_URL}/${event.image_path}`}
                    controls
                    className="h-full w-full rounded-none"
                  />
                </div>
              ) : (
                <div className="border border-zinc-200 bg-zinc-50 p-1">
                  <img
                    src={`${API_URL}/${event.image_path}`}
                    alt={event.title}
                    className="w-full rounded-none object-cover"
                  />
                </div>
              )
            ) : (
              <div className="flex aspect-video items-center justify-center bg-zinc-50 border border-dashed border-zinc-300 rounded-none">
                <div className="text-center">
                  <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground/30" />
                  <p className="mt-1 text-xs text-muted-foreground">
                    No media attached
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-none border-zinc-200 bg-white shadow-sm h-fit">
          <CardHeader className="border-b border-zinc-100 pb-3 pt-4 px-4">
            <CardTitle className="text-sm font-medium">Event Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4 px-4 pb-4">
            <div className="grid gap-1">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                Title
              </p>
              <p className="text-base font-medium text-foreground">
                {event.title}
              </p>
            </div>

            <div className="grid gap-1">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                Date
              </p>
              <div className="flex items-center gap-2 text-foreground text-sm">
                <CalendarBlankIcon className="h-4 w-4 text-muted-foreground" />
                {event.date}
              </div>
            </div>

            <div className="grid gap-1">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                Description
              </p>
              <div className="rounded-none border border-zinc-100 bg-zinc-50 p-3 text-sm text-foreground">
                {event.description || "No description provided"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="rounded-none border-zinc-200 bg-white shadow-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &apos;{event.title}&apos;? This
              will also remove the associated media from storage. This action
              cannot be undone.
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
    </CMSLayout>
  );
}
