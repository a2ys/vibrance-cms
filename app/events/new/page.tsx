"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { compressImage } from "@/lib/utils";
import Link from "next/link";

export default function NewEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        try {
          setIsCompressing(true);
          const objectUrl = URL.createObjectURL(selectedFile);
          setPreview(objectUrl);

          const compressedFile = await compressImage(selectedFile);
          setFile(compressedFile);

          const compressedUrl = URL.createObjectURL(compressedFile);
          setPreview(compressedUrl);
        } catch {
          alert("Failed to process image. Please try another.");
          setFile(null);
          setPreview(null);
        } finally {
          setIsCompressing(false);
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
      if (isCompressing) return;

      setLoading(true);

      const formData = new FormData();
      formData.append("title", title);
      formData.append("date", date);
      formData.append("description", description);
      if (file) formData.append("file", file);

      try {
        const res = await fetch(`${API_URL}/events`, {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          router.push("/events");
        } else {
          alert("Error creating event");
        }
      } catch {
        alert("Error creating event");
      } finally {
        setLoading(false);
      }
    },
    [title, date, description, file, isCompressing, router],
  );

  return (
    <CMSLayout
      title="Create Event"
      description="Add a new event to your calendar"
      actions={
        <Link href="/events" className="cursor-pointer">
          <Button
            variant="outline"
            className="rounded-none bg-white hover:bg-zinc-50 border-zinc-200 h-8 text-xs cursor-pointer"
          >
            <ArrowLeftIcon className="mr-2 h-3.5 w-3.5" />
            Back to Events
          </Button>
        </Link>
      }
    >
      <div className="bg-zinc-50 min-h-screen">
        <Card className="max-w-2xl rounded-none border-zinc-200 bg-white shadow-sm">
          <CardHeader className="border-b border-zinc-100 pb-3 pt-4 px-4">
            <CardTitle className="text-base">Event Details</CardTitle>
            <p className="text-xs text-muted-foreground">
              Fill in the information below to create a new event. The poster
              will be compressed and saved to /images/posters/.
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
                  className="rounded-none bg-white focus-visible:ring-0 focus-visible:border-zinc-800 resize-none text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Event Poster</Label>
                <p className="text-[10px] text-muted-foreground mb-1.5">
                  Upload an image (PNG, JPG). It will be automatically converted
                  to <strong>WebP</strong> for better performance.
                </p>
                {file || isCompressing ? (
                  <div className="relative rounded-none border border-zinc-200 p-3 bg-zinc-50">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 h-6 w-6 rounded-none hover:bg-zinc-200 cursor-pointer"
                      onClick={clearFile}
                      disabled={isCompressing}
                    >
                      <XIcon className="h-3.5 w-3.5" />
                    </Button>
                    <div className="flex items-center gap-3">
                      {preview ? (
                        <div className="relative h-20 w-20 border border-zinc-200 bg-white p-1">
                          <img
                            src={preview}
                            alt="Preview"
                            className={`h-full w-full object-cover transition-opacity ${
                              isCompressing ? "opacity-50" : "opacity-100"
                            }`}
                          />
                          {isCompressing && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <SpinnerIcon className="h-5 w-5 animate-spin text-zinc-800" />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex h-20 w-20 items-center justify-center bg-white border border-zinc-200 rounded-none">
                          {isCompressing ? (
                            <SpinnerIcon className="h-6 w-6 animate-spin text-muted-foreground" />
                          ) : (
                            <UploadSimpleIcon className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                      )}
                      <div>
                        {isCompressing ? (
                          <p className="font-medium text-foreground animate-pulse text-sm">
                            Compressing image...
                          </p>
                        ) : (
                          <>
                            <p className="font-medium text-foreground text-sm">
                              {file?.name}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                              <span>
                                {(file!.size / 1024 / 1024).toFixed(2)} MB
                              </span>
                              <span className="rounded-none bg-green-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-green-700">
                                WebP Ready
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-none border-2 border-dashed border-zinc-300 p-6 transition-colors hover:bg-zinc-50 hover:border-zinc-400 bg-white group">
                    <UploadSimpleIcon className="mb-2 h-6 w-6 text-muted-foreground group-hover:text-zinc-600" />
                    <span className="text-sm text-muted-foreground font-medium group-hover:text-zinc-700">
                      Click to upload or drag and drop
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">
                      PNG, JPG up to 10MB
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                )}
              </div>

              <div className="flex gap-2 pt-2 border-t border-zinc-100">
                <Button
                  type="submit"
                  disabled={loading || isCompressing}
                  className="flex-1 rounded-none h-9 text-sm cursor-pointer"
                >
                  {loading
                    ? "Creating..."
                    : isCompressing
                      ? "Processing Image..."
                      : "Create Event"}
                </Button>
                <Link href="/events" className="cursor-pointer">
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
