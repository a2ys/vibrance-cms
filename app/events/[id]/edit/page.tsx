"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CMSLayout } from "@/components/cms/cms-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { UploadSimpleIcon, ArrowLeftIcon, XIcon } from "@phosphor-icons/react";
import { API_URL } from "@/lib/config";
import type { Event } from "@/lib/types";
import Link from "next/link";

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setRemoveExisting(false);
      if (selectedFile.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result as string);
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview(null);
      }
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
  };

  if (loading) {
    return (
      <CMSLayout title="Loading..." description="Please wait">
        <Card className="rounded-none border-zinc-200 bg-white shadow-sm">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Loading event details...</p>
          </CardContent>
        </Card>
      </CMSLayout>
    );
  }

  if (!event) {
    return (
      <CMSLayout title="Event Not Found" description="The event does not exist">
        <Card className="rounded-none border-zinc-200 bg-white shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">Event not found</p>
            <Link href="/events" className="mt-4">
              <Button className="rounded-none">
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
      title="Edit Event"
      description={`Editing: ${event.title}`}
      actions={
        <Link href={`/events/${event.id}`}>
          <Button
            variant="outline"
            className="rounded-none bg-white hover:bg-zinc-50 border-zinc-200"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Event
          </Button>
        </Link>
      }
    >
      <div className="bg-zinc-50 min-h-screen">
        <Card className="max-w-2xl rounded-none border-zinc-200 bg-white shadow-sm">
          <CardHeader className="border-b border-zinc-100 pb-4">
            <CardTitle>Edit Event Details</CardTitle>
            <p className="text-sm text-muted-foreground">
              Update the event information below.
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter event title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="rounded-none bg-white focus-visible:ring-0 focus-visible:border-zinc-800"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Event Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="rounded-none bg-white focus-visible:ring-0 focus-visible:border-zinc-800"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter event description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="rounded-none bg-white focus-visible:ring-0 focus-visible:border-zinc-800"
                />
              </div>

              <div className="space-y-2">
                <Label>Event Poster</Label>

                {event.image_path && !file && !removeExisting && (
                  <div className="rounded-none border border-zinc-200 bg-zinc-50 p-4 mb-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      Current media:
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="h-24 w-24 border border-zinc-200 bg-white p-1">
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
                  <div className="relative rounded-none border border-zinc-200 p-4 bg-zinc-50">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 h-6 w-6 rounded-none hover:bg-zinc-200"
                      onClick={clearFile}
                    >
                      <XIcon className="h-4 w-4" />
                    </Button>
                    <p className="text-sm text-muted-foreground mb-2">
                      New media (will replace existing):
                    </p>
                    <div className="flex items-center gap-4">
                      {preview ? (
                        <div className="h-24 w-24 border border-zinc-200 bg-white p-1">
                          <img
                            src={preview}
                            alt="Preview"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-24 w-24 items-center justify-center bg-white border border-zinc-200 rounded-none">
                          <UploadSimpleIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-foreground">
                          {file.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-none border-2 border-dashed border-zinc-300 p-8 transition-colors hover:bg-zinc-50 hover:border-zinc-400 bg-white">
                    <UploadSimpleIcon className="mb-2 h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground font-medium">
                      Click to upload new poster
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">
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

              <div className="flex gap-3 pt-4 border-t border-zinc-100">
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-none"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Link href={`/events/${event.id}`}>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-none bg-white border-zinc-200"
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
