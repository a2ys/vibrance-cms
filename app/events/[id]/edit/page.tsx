"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { CMSLayout } from "@/components/cms/cms-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UploadSimpleIcon,
  ArrowLeftIcon,
  XIcon,
  SpinnerIcon,
  ImageIcon,
} from "@phosphor-icons/react";
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
import { API_URL } from "@/lib/config";
import type { Event } from "@/lib/types";
import Link from "next/link";
import { compressImage } from "@/lib/utils";

const EVENT_FOR_OPTIONS = ["VITian", "Non VITian", "Both"];

type EventFormData = {
  event_name: string;
  club_name: string;
  event_type: string;
  event_for: string;
  start_date_time: string;
  end_date_time: string;
  price_per_person: string;
  participation_type: string;
  event_venue: string;
  short_description: string;
  long_description: string;
  is_special_event: boolean;
  registration_link: string;
  team_size: string;
  poster_path: string;
};

const toInputDate = (dateStr?: string) => {
  if (!dateStr) return "";
  return dateStr.replace(" ", "T").slice(0, 16);
};

function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse bg-zinc-200 ${className}`} />;
}

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<EventFormData>({
    event_name: "",
    club_name: "",
    event_type: "",
    event_for: "",
    start_date_time: "",
    end_date_time: "",
    price_per_person: "",
    participation_type: "",
    event_venue: "",
    short_description: "",
    long_description: "",
    is_special_event: false,
    registration_link: "",
    team_size: "",
    poster_path: "",
  });

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
        const res = await fetch(`${API_URL}/events/${params.id}`);
        if (!res.ok) throw new Error("Event not found");

        const data: Event = await res.json();

        setFormData({
          event_name: data.event_name ?? "",
          club_name: data.club_name ?? "",
          event_type: data.event_type ?? "",
          event_for: data.event_for ?? "",
          start_date_time: data.start_date_time ?? "",
          end_date_time: data.end_date_time ?? "",
          price_per_person:
            data.price_per_person !== undefined
              ? String(data.price_per_person)
              : "",
          participation_type: data.participation_type ?? "",
          event_venue: data.event_venue ?? "",
          short_description: data.short_description ?? "",
          long_description: data.long_description ?? "",
          is_special_event: Boolean(data.is_special_event),
          registration_link: data.registration_link ?? "",
          team_size: data.team_size ?? "",
          poster_path: data.poster_path ?? "",
        });
      } catch {
      } finally {
        setLoading(false);
      }
    }
    if (params.id) fetchEvent();
  }, [params.id]);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        try {
          setIsCompressing(true);
          const processedFile = await compressImage(selectedFile);
          setFile(processedFile);

          if (processedFile.type.startsWith("image/")) {
            const objectUrl = URL.createObjectURL(processedFile);
            setPreview(objectUrl);
          } else {
            setPreview(null);
          }
        } catch (error) {
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

  const handleSaveClick = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSaveDialog(true);
  };

  const confirmSave = async () => {
    if (isCompressing) return;
    setSaving(true);
    setShowSaveDialog(false);

    try {
      let finalPosterPath = formData.poster_path;

      if (file) {
        const formDataUpload = new FormData();
        formDataUpload.append("file", file);
        const uploadRes = await fetch(`${API_URL}/media/upload`, {
          method: "POST",
          body: formDataUpload,
        });
        if (!uploadRes.ok) throw new Error("Upload failed");
        const uploadData = await uploadRes.json();
        finalPosterPath = uploadData.key;
      }

      const payload = {
        ...formData,
        poster_path: finalPosterPath,
        start_date_time: formData.start_date_time?.replace("T", " ") + ":00",
        end_date_time: formData.end_date_time?.replace("T", " ") + ":00",
        price_per_person: Number(formData.price_per_person || 0),
        is_special_event: formData.is_special_event ? 1 : 0,
      };

      const res = await fetch(`${API_URL}/events/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push(`/events/${params.id}`);
        router.refresh();
      }
    } catch {
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <CMSLayout title="Loading..." description="Please wait">
        <div className="bg-zinc-50 p-3 sm:p-4">
          <Card className="max-w-3xl rounded-none border-zinc-200 bg-white shadow-sm p-0">
            <CardHeader className="border-b border-zinc-100 p-4">
              <Skeleton className="h-5 w-32 mb-1" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <Skeleton className="h-96 w-full" />
            </CardContent>
          </Card>
        </div>
      </CMSLayout>
    );
  }

  if (!formData.event_name && !loading) return null;

  return (
    <CMSLayout
      title="Edit Event"
      description={`Editing: ${formData.event_name}`}
      actions={
        <Link href={`/events/${params.id}`} className="cursor-pointer">
          <Button
            variant="outline"
            className="rounded-none bg-white hover:bg-zinc-50 border-zinc-200 h-8 text-xs sm:text-sm cursor-pointer px-3"
          >
            <ArrowLeftIcon className="mr-1.5 h-3.5 w-3.5" />
            Back to Event
          </Button>
        </Link>
      }
    >
      <div className="bg-zinc-50 p-3 sm:p-4">
        <Card className="max-w-3xl rounded-none border-zinc-200 bg-white shadow-sm h-fit">
          <CardHeader className="border-b border-zinc-100 p-4">
            <CardTitle className="text-base font-medium">
              Edit Event Details
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Update event information below.
            </p>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <form
              onSubmit={handleSaveClick}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.preventDefault();
              }}
              className="space-y-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm">Event Name *</Label>
                  <Input
                    required
                    value={formData.event_name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        event_name: e.target.value,
                      })
                    }
                    className="rounded-none bg-white h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Club Name</Label>
                  <Input
                    value={formData.club_name}
                    onChange={(e) =>
                      setFormData({ ...formData, club_name: e.target.value })
                    }
                    className="rounded-none bg-white h-9 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm">Event Type</Label>
                  <Input
                    value={formData.event_type}
                    onChange={(e) =>
                      setFormData({ ...formData, event_type: e.target.value })
                    }
                    className="rounded-none bg-white h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Event For</Label>
                  <Select
                    value={formData.event_for}
                    onValueChange={(val) =>
                      setFormData({ ...formData, event_for: val })
                    }
                  >
                    <SelectTrigger className="rounded-none bg-white h-9 w-full text-sm">
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent className="rounded-none">
                      {EVENT_FOR_OPTIONS.map((opt) => (
                        <SelectItem
                          key={opt}
                          value={opt}
                          className="text-sm rounded-none"
                        >
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm">Start Date & Time</Label>
                  <Input
                    type="datetime-local"
                    required
                    value={toInputDate(formData.start_date_time)}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        start_date_time: e.target.value,
                      })
                    }
                    className="rounded-none bg-white h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">End Date & Time</Label>
                  <Input
                    type="datetime-local"
                    value={toInputDate(formData.end_date_time)}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        end_date_time: e.target.value,
                      })
                    }
                    className="rounded-none bg-white h-9 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm">Price (₹)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.price_per_person}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price_per_person: e.target.value,
                      })
                    }
                    className="rounded-none bg-white h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Participation Type</Label>
                  <Input
                    placeholder="e.g. Individual"
                    value={formData.participation_type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        participation_type: e.target.value,
                      })
                    }
                    className="rounded-none bg-white h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Venue</Label>
                  <Input
                    value={formData.event_venue}
                    onChange={(e) =>
                      setFormData({ ...formData, event_venue: e.target.value })
                    }
                    className="rounded-none bg-white h-9 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm">Short Description</Label>
                <Input
                  value={formData.short_description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      short_description: e.target.value,
                    })
                  }
                  className="rounded-none bg-white h-9 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm">Long Description</Label>
                <Textarea
                  value={formData.long_description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      long_description: e.target.value,
                    })
                  }
                  className="rounded-none bg-white min-h-[100px] text-sm"
                />
              </div>

              <div className="flex items-center space-x-2 border border-zinc-100 bg-zinc-50 p-3 rounded-none">
                <Switch
                  id="special-mode"
                  checked={Boolean(formData.is_special_event)}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_special_event: checked })
                  }
                />
                <Label
                  htmlFor="special-mode"
                  className="cursor-pointer text-sm font-medium"
                >
                  Mark as Special Event
                </Label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm">Registration Link</Label>
                  <Input
                    value={formData.registration_link}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        registration_link: e.target.value,
                      })
                    }
                    className="rounded-none bg-white h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Team Size</Label>
                  <Input
                    value={formData.team_size}
                    onChange={(e) =>
                      setFormData({ ...formData, team_size: e.target.value })
                    }
                    className="rounded-none bg-white h-9 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-zinc-100">
                <Label className="text-sm">Event Poster</Label>

                {formData.poster_path && !file && (
                  <div className="rounded-none border border-zinc-200 bg-zinc-50 p-3 mb-2 flex items-center gap-3">
                    <div className="h-12 w-12 shrink-0 border border-zinc-200 bg-white flex items-center justify-center overflow-hidden">
                      <img
                        src={`${API_URL}/${formData.poster_path}`}
                        alt="Current"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">
                        Current File
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate max-w-[200px]">
                        {formData.poster_path}
                      </p>
                    </div>
                  </div>
                )}

                {file ? (
                  <div className="relative rounded-none border border-zinc-200 p-3 bg-zinc-50">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={clearFile}
                      disabled={isCompressing}
                      className="absolute right-2 top-2 h-6 w-6 rounded-none hover:bg-zinc-200 cursor-pointer"
                    >
                      <XIcon className="h-3.5 w-3.5" />
                    </Button>
                    <div className="flex items-center gap-3">
                      <div className="relative h-14 w-14 border border-zinc-200 bg-white flex items-center justify-center overflow-hidden">
                        {preview ? (
                          <img
                            src={preview}
                            alt="Preview"
                            className={`h-full w-full object-cover ${isCompressing ? "opacity-50" : ""}`}
                          />
                        ) : (
                          <UploadSimpleIcon className="m-auto" />
                        )}
                        {isCompressing && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/50">
                            <SpinnerIcon className="animate-spin" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        {isCompressing ? (
                          <p className="font-medium text-foreground animate-pulse text-xs">
                            Compressing...
                          </p>
                        ) : (
                          <>
                            <p className="font-medium text-foreground text-sm truncate max-w-[200px]">
                              {file?.name}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>
                                {(file!.size / 1024 / 1024).toFixed(2)} MB
                              </span>
                              <span className="bg-green-100 text-green-700 px-1.5 py-0.5 font-bold uppercase text-[10px]">
                                Ready
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-none border border-dashed border-zinc-300 p-4 hover:bg-zinc-50 bg-white transition-colors">
                    <UploadSimpleIcon className="mb-1 h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground font-medium">
                      Click to upload poster
                    </span>
                    <span className="text-xs text-muted-foreground mt-0.5">
                      Supports Images (Auto-WebP)
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

              <div className="flex gap-3 pt-4 border-t border-zinc-100">
                <Button
                  type="submit"
                  disabled={saving || isCompressing}
                  className="flex-1 rounded-none h-9 text-xs sm:text-sm font-medium cursor-pointer"
                >
                  {saving ? (
                    <>
                      <SpinnerIcon className="mr-2 h-3.5 w-3.5 animate-spin" />{" "}
                      Saving...
                    </>
                  ) : isCompressing ? (
                    "Processing..."
                  ) : (
                    "Save Changes"
                  )}
                </Button>
                <Link href={`/events/${params.id}`} className="cursor-pointer">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-none bg-white h-9 text-xs sm:text-sm font-medium cursor-pointer"
                  >
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <AlertDialogContent className="rounded-none border-zinc-200 bg-white shadow-lg max-w-sm p-5 w-[95vw]">
            <AlertDialogHeader className="space-y-2">
              <AlertDialogTitle className="text-base">
                Save Changes?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm">
                Are you sure you want to update this event? This action will
                overwrite the existing event details.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-4">
              <AlertDialogCancel className="rounded-none border-zinc-200 bg-white hover:bg-zinc-50 h-8 text-sm cursor-pointer">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmSave}
                className="rounded-none bg-zinc-900 text-white hover:bg-zinc-800 h-8 text-sm cursor-pointer"
              >
                Confirm Save
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </CMSLayout>
  );
}
