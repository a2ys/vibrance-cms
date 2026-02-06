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
  MapPinIcon,
  UsersIcon,
  CurrencyInrIcon,
  LinkIcon,
  BuildingsIcon,
} from "@phosphor-icons/react";
import { API_URL } from "@/lib/config";
import type { Event } from "@/lib/types";
import { formatDate } from "@/lib/utils";
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
        const res = await fetch(`${API_URL}/events/${params.id}`);
        if (!res.ok) {
          setEvent(null);
          return;
        }
        const data = await res.json();
        setEvent(data);
      } catch (err) {
        setEvent(null);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchEvent();
    }
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
        <div className="grid gap-4 lg:grid-cols-3 bg-zinc-50 p-3 sm:p-4">
          <Card className="rounded-none border-zinc-200 bg-white shadow-sm h-fit lg:col-span-1 p-0">
            <CardHeader className="p-4 border-b border-zinc-100">
              <Skeleton className="h-5 w-24" />
            </CardHeader>
            <CardContent className="p-4">
              <Skeleton className="aspect-square w-full" />
            </CardContent>
          </Card>
          <Card className="rounded-none border-zinc-200 bg-white shadow-sm h-fit lg:col-span-2 p-0">
            <CardHeader className="p-4 border-b border-zinc-100">
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="space-y-5 p-4 sm:p-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-3/4" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-32 w-full" />
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
        <Card className="rounded-none border-zinc-200 bg-white shadow-sm mx-4 mt-4">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <h3 className="mt-2 font-medium text-foreground text-base">
              Event not found
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              The event you are looking for does not exist or has been deleted.
            </p>
            <Link href="/events" className="mt-4 cursor-pointer">
              <Button className="rounded-none cursor-pointer h-9 text-sm">
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Back to Events
              </Button>
            </Link>
          </CardContent>
        </Card>
      </CMSLayout>
    );
  }

  return (
    <CMSLayout
      title={event.event_name}
      description={`Managed by ${event.club_name || "Unknown Club"}`}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/events" className="cursor-pointer">
            <Button
              variant="outline"
              className="rounded-none bg-white hover:bg-zinc-50 border-zinc-200 h-8 text-xs sm:text-sm cursor-pointer px-3"
            >
              <ArrowLeftIcon className="mr-1.5 h-3.5 w-3.5" />
              Back
            </Button>
          </Link>
          <Link href={`/events/${event.id}/edit`} className="cursor-pointer">
            <Button
              variant="outline"
              className="rounded-none bg-white hover:bg-zinc-50 border-zinc-200 h-8 text-xs sm:text-sm cursor-pointer px-3"
            >
              <PencilSimpleIcon className="mr-1.5 h-3.5 w-3.5" />
              Edit
            </Button>
          </Link>
          <Button
            onClick={() => setShowDeleteDialog(true)}
            variant="destructive"
            className="rounded-none h-8 text-xs sm:text-sm cursor-pointer px-3"
          >
            <TrashIcon className="mr-1.5 h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 lg:grid-cols-3 bg-zinc-50">
        <div className="lg:col-span-1 space-y-4">
          <Card className="rounded-none border-zinc-200 bg-white shadow-sm h-fit gap-0">
            <CardHeader className="border-b border-zinc-100 p-4">
              <CardTitle className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wide">
                <ImageIcon className="h-4 w-4" /> Poster Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {event.poster_path ? (
                <div className="bg-zinc-100 aspect-square flex items-center justify-center overflow-hidden">
                  <img
                    src={`${API_URL}/${event.poster_path}`}
                    alt={event.event_name}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="flex aspect-square items-center justify-center bg-zinc-50 border-dashed border-zinc-200">
                  <div className="text-center p-6">
                    <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground/30" />
                    <p className="mt-2 text-xs text-muted-foreground">
                      No media attached
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <Card className="rounded-none border-zinc-200 bg-white shadow-sm h-fit">
            <CardHeader className="border-b border-zinc-100 p-4">
              <CardTitle className="text-base font-medium">
                Event Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-4 sm:p-6">
              <div className="grid gap-1">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Event Name
                </p>
                <h2 className="text-2xl font-semibold text-foreground tracking-tight break-words">
                  {event.event_name}
                </h2>
                {event.club_name && (
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="inline-flex items-center gap-1.5 rounded-none bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">
                      <BuildingsIcon className="h-3.5 w-3.5" />
                      {event.club_name}
                    </span>
                    {(event.is_special_event === true ||
                      event.is_special_event === 1) && (
                      <span className="inline-flex items-center rounded-none bg-amber-50 border border-amber-200 px-2 py-1 text-xs font-medium text-amber-700">
                        Special Event
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="grid gap-6 sm:grid-cols-2 border-t border-zinc-50 pt-4">
                <div className="space-y-4">
                  <div className="grid gap-1">
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                      <CalendarBlankIcon className="h-3.5 w-3.5" /> Start Time
                    </p>
                    <p className="text-sm sm:text-base font-medium text-zinc-800">
                      {formatDate(event.start_date_time)}
                    </p>
                  </div>
                  {event.end_date_time && (
                    <div className="grid gap-1">
                      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                        <CalendarBlankIcon className="h-3.5 w-3.5" /> End Time
                      </p>
                      <p className="text-sm sm:text-base font-medium text-zinc-800">
                        {formatDate(event.end_date_time)}
                      </p>
                    </div>
                  )}
                  <div className="grid gap-1">
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                      <MapPinIcon className="h-3.5 w-3.5" /> Venue
                    </p>
                    <p className="text-sm sm:text-base font-medium text-zinc-800">
                      {event.event_venue || "TBD"}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-1">
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                      <CurrencyInrIcon className="h-3.5 w-3.5" /> Price
                    </p>
                    <p className="text-sm sm:text-base font-medium text-zinc-800">
                      {event.price_per_person
                        ? `₹${event.price_per_person}`
                        : "Free"}
                    </p>
                  </div>
                  <div className="grid gap-1">
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                      <UsersIcon className="h-3.5 w-3.5" /> Team Size
                    </p>
                    <p className="text-sm sm:text-base font-medium text-zinc-800">
                      {event.team_size === "1"
                        ? `${event.team_size} Member`
                        : `${event.team_size} Members`}
                    </p>
                  </div>
                  {event.registration_link && (
                    <div className="grid gap-1">
                      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                        <LinkIcon className="h-3.5 w-3.5" /> Registration
                      </p>
                      <a
                        href={event.registration_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm sm:text-base font-medium text-blue-600 hover:underline truncate block cursor-pointer"
                      >
                        {event.registration_link}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-2 pt-4 border-t border-zinc-100">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Description
                </p>
                <div className="rounded-none bg-zinc-50 border border-zinc-100 p-4 text-sm sm:text-base text-zinc-700 leading-relaxed whitespace-pre-wrap">
                  {event.long_description ||
                    event.short_description ||
                    "No description provided"}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="rounded-none border-zinc-200 bg-white shadow-lg p-5 w-[95vw] max-w-sm">
          <AlertDialogHeader className="space-y-2">
            <AlertDialogTitle className="text-base">
              Delete Event
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Are you sure you want to delete{" "}
              <span className="font-bold text-foreground">
                {event.event_name}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="rounded-none border-zinc-200 bg-white hover:bg-zinc-50 h-8 text-sm cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="rounded-none bg-destructive text-destructive-foreground hover:bg-destructive/90 h-8 text-sm cursor-pointer"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </CMSLayout>
  );
}
