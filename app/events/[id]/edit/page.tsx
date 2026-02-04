"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { CMSLayout } from "@/components/cms/cms-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  UploadSimpleIcon,
  ArrowLeftIcon,
  XIcon,
  SpinnerIcon,
} from "@phosphor-icons/react";
import { API_URL } from "@/lib/config";
import type { Event } from "@/lib/types";
import Link from "next/link";

function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse bg-zinc-200 ${className}`} />;
}

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [removeExisting, setRemoveExisting] = useState(false);

  // Cleanup object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (preview && !preview.startsWith("data:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch(`${API_URL}/events`);
        const data = await res.json();
        const foundEvent = data.find(
          (e: Event) => String(e.id) === String(params.id),
        );

        if (foundEvent) {
          setEvent(foundEvent);
          setTitle(foundEvent.title);
          setDate(foundEvent.date);
          setDescription(foundEvent.description || "");
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [params.id]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        setFile(selectedFile);
        setRemoveExisting(false);
        if (selectedFile.type.startsWith("image/")) {
          const objectUrl = URL.createObjectURL(selectedFile);
          setPreview(objectUrl);
        } else {
          setPreview(null);
        }
      }
    },
    [],
  );

  const clearFile = useCallback(() => {
    setFile(null);
    setPreview(null);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);

      try {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("date", date);
        formData.append("description", description);

        if (file) {
          formData.append("file", file);
        }

        const res = await fetch(`${API_URL}/events/${params.id}`, {
          method: "PUT",
          body: formData,
        });

        if (res.ok) {
          router.push("/events");
        } else {
          const err = await res.json();
          alert("Error updating event: " + (err.error || "Unknown error"));
        }
      } catch {
        alert("Failed to connect to server");
      } finally {
        setSaving(false);
      }
    },
    [title, date, description, file, params.id, router],
  );

  if (loading) {
    return (
      <CMSLayout title="Loading..." description="Please wait">
        <div className="bg-zinc-50 min-h-screen">
          <Card className="max-w-2xl rounded-none border-zinc-200 bg-white shadow-sm">
            <CardHeader className="border-b border-zinc-100 pb-3 pt-4 px-4">
              <Skeleton className="h-6 w-32 mb-1" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="pt-4 px-4 pb-4 space-y-4">
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-9 w-full" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-9 w-full" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-24 w-full" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-24" />
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
        <Card className="rounded-none border-zinc-200 bg-white shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground text-sm">Event not found</p>
            <Link href="/events" className="mt-4 cursor-pointer">
              <Button className="rounded-none cursor-pointer h-8 text-xs">
                <ArrowLeftIcon className="mr-2 h-3.5 w-3.5" />
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
      title="Edit Event"
      description={`Editing: ${event.title}`}
      actions={
        <Link href={`/events/${event.id}`} className="cursor-pointer">
          <Button
            variant="outline"
            className="rounded-none bg-white hover:bg-zinc-50 border-zinc-200 h-8 text-xs cursor-pointer"
          >
            <ArrowLeftIcon className="mr-2 h-3.5 w-3.5" />
            Back to Event
          </Button>
        </Link>
      }
    >
      <div className="bg-zinc-50 min-h-screen">
        <Card className="max-w-2xl rounded-none border-zinc-200 bg-white shadow-sm">
          <CardHeader className="border-b border-zinc-100 pb-3 pt-4 px-4">
            <CardTitle className="text-base">Edit Event Details</CardTitle>
            <p className="text-xs text-muted-foreground">
              Update the event information below.
            </p>
          </CardHeader>
          <CardContent className="pt-4 px-4 pb-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs">
                  Event Title *
                </Label>
                <Input
                  id="title"
                  placeholder="Enter event title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="rounded-none bg-white focus-visible:ring-0 focus-visible:border-zinc-800 h-9 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="date" className="text-xs">
                  Event Date *
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="rounded-none bg-white focus-visible:ring-0 focus-visible:border-zinc-800 h-9 text-sm cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-xs">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Enter event description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="rounded-none bg-white focus-visible:ring-0 focus-visible:border-zinc-800 text-sm resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Event Poster</Label>

                {event.image_path && !file && !removeExisting && (
                  <div className="rounded-none border border-zinc-200 bg-zinc-50 p-3 mb-2">
                    <p className="text-[10px] text-muted-foreground mb-1.5">
                      Current media:
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="h-20 w-20 border border-zinc-200 bg-white p-1">
                        <img
                          src={`${API_URL}/${event.image_path}`}
                          alt={event.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {file ? (
                  <div className="relative rounded-none border border-zinc-200 p-3 bg-zinc-50">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 h-6 w-6 rounded-none hover:bg-zinc-200 cursor-pointer"
                      onClick={clearFile}
                    >
                      <XIcon className="h-3.5 w-3.5" />
                    </Button>
                    <p className="text-[10px] text-muted-foreground mb-1.5">
                      New media (will replace existing):
                    </p>
                    <div className="flex items-center gap-3">
                      {preview ? (
                        <div className="h-20 w-20 border border-zinc-200 bg-white p-1">
                          <img
                            src={preview}
                            alt="Preview"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-20 w-20 items-center justify-center bg-white border border-zinc-200 rounded-none">
                          <UploadSimpleIcon className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-foreground text-sm">
                          {file.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-none border-2 border-dashed border-zinc-300 p-6 transition-colors hover:bg-zinc-50 hover:border-zinc-400 bg-white group">
                    <UploadSimpleIcon className="mb-2 h-6 w-6 text-muted-foreground group-hover:text-zinc-600" />
                    <span className="text-sm text-muted-foreground font-medium group-hover:text-zinc-700">
                      Click to upload new poster
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">
                      (Optional) Replaces current image
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*,video/mp4"
                      onChange={handleFileChange}
                    />
                  </label>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t border-zinc-100">
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-none h-9 text-sm cursor-pointer"
                >
                  {saving ? (
                    <>
                      <SpinnerIcon className="mr-2 h-3.5 w-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
                <Link href={`/events/${event.id}`} className="cursor-pointer">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-none bg-white border-zinc-200 h-9 text-sm cursor-pointer"
                  >
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </CMSLayout>
  );
}
