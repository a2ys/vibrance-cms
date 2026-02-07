"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import { SpinnerIcon, UploadSimpleIcon, XIcon } from "@phosphor-icons/react";
import { API_URL } from "@/lib/config";
import { compressImage } from "@/lib/utils";
import type { Event } from "@/lib/types";

const toInputDate = (dateStr?: string) => {
  if (!dateStr) return "";
  return dateStr.replace(" ", "T").slice(0, 16);
};

const EVENT_FOR_OPTIONS = ["VITian", "Non VITian", "Both"];

export function EventForm({ initialData }: { initialData?: Event }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Event>>({
    event_name: initialData?.event_name || "",
    club_name: initialData?.club_name || "",
    event_type: initialData?.event_type || "",
    event_for: initialData?.event_for || "",
    start_date_time: initialData?.start_date_time || "",
    end_date_time: initialData?.end_date_time || "",
    price_per_person: initialData?.price_per_person || 0,
    participation_type: initialData?.participation_type || "",
    event_venue: initialData?.event_venue || "",
    short_description: initialData?.short_description || "",
    long_description: initialData?.long_description || "",
    is_special_event: !!initialData?.is_special_event,
    registration_link:
      initialData?.registration_link ||
      "https://chennaievents.vit.ac.in/vitchennai_vibrance/",
    team_size: initialData?.team_size || "",
    poster_path: initialData?.poster_path || "",
  });

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
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

  const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isCompressing) return;
    setLoading(true);

    try {
      let finalPosterPath = formData.poster_path;

      if (file) {
        const formDataUpload = new FormData();
        formDataUpload.append("file", file);
        const uploadRes = await fetch(`${API_URL}/media/upload`, {
          method: "POST",
          body: formDataUpload,
        });
        const uploadData = await uploadRes.json();
        finalPosterPath = uploadData.key;
      }

      const payload = {
        ...formData,
        poster_path: finalPosterPath,
        start_date_time: formData.start_date_time?.replace("T", " ") + ":00",
        end_date_time: formData.end_date_time?.replace("T", " ") + ":00",
        is_special_event: formData.is_special_event ? 1 : 0,
      };

      const url = initialData
        ? `${API_URL}/events/${initialData.id}`
        : `${API_URL}/events`;

      const method = initialData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/events");
        router.refresh();
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.preventDefault();
      }}
      className="space-y-5 max-w-2xl"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm">Event Name</Label>
          <Input
            required
            value={formData.event_name}
            onChange={(e) =>
              setFormData({ ...formData, event_name: e.target.value })
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
            onValueChange={(value) =>
              setFormData({ ...formData, event_for: value })
            }
          >
            <SelectTrigger className="bg-white rounded-none w-full h-9 text-sm">
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
              setFormData({ ...formData, start_date_time: e.target.value })
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
              setFormData({ ...formData, end_date_time: e.target.value })
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
                price_per_person: Number(e.target.value),
              })
            }
            className="rounded-none bg-white h-9 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm">Participation</Label>
          <Input
            placeholder="e.g. Individual"
            value={formData.participation_type}
            onChange={(e) =>
              setFormData({ ...formData, participation_type: e.target.value })
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
            setFormData({ ...formData, short_description: e.target.value })
          }
          className="rounded-none bg-white h-9 text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm">Long Description</Label>
        <Textarea
          className="min-h-[100px] rounded-none bg-white text-sm"
          value={formData.long_description}
          onChange={(e) =>
            setFormData({ ...formData, long_description: e.target.value })
          }
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
        <Label htmlFor="special-mode" className="text-sm cursor-pointer">
          Is Special Event?
        </Label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm">Registration Link</Label>
          <Input
            value={formData.registration_link}
            onChange={(e) =>
              setFormData({ ...formData, registration_link: e.target.value })
            }
            className="rounded-none bg-white h-9 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm">Team Size</Label>
          <Input
            placeholder="e.g. 1-4"
            value={formData.team_size}
            onChange={(e) =>
              setFormData({ ...formData, team_size: e.target.value })
            }
            className="rounded-none bg-white h-9 text-sm"
          />
        </div>
      </div>

      <div className="space-y-1.5 pt-2 border-t border-zinc-100">
        <Label className="text-sm">Poster Image</Label>
        {initialData?.poster_path && !file && (
          <div className="flex items-center gap-3 rounded-none border border-zinc-200 bg-zinc-50 p-2 mb-2">
            <div className="h-12 w-12 border border-zinc-200 bg-white p-0.5 shrink-0">
              <img
                src={`${API_URL}/${initialData.poster_path}`}
                alt="Current"
                className="h-full w-full object-cover"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Current poster attached
            </p>
          </div>
        )}

        {file || isCompressing ? (
          <div className="relative rounded-none border border-zinc-200 p-3 bg-zinc-50 flex items-center gap-3">
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
            <div className="relative h-14 w-14 border border-zinc-200 bg-white p-0.5 shrink-0">
              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className={`h-full w-full object-cover transition-opacity ${isCompressing ? "opacity-50" : "opacity-100"}`}
                />
              )}
              {isCompressing && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <SpinnerIcon className="h-5 w-5 animate-spin text-zinc-800" />
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
                  <p className="font-medium text-foreground text-sm truncate">
                    {file?.name}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{(file!.size / 1024 / 1024).toFixed(2)} MB</span>
                    <span className="bg-green-100 text-green-700 px-1.5 py-0.5 text-[10px] font-bold uppercase">
                      Ready
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-none border border-dashed border-zinc-300 p-4 hover:bg-zinc-50 bg-white transition-colors">
            <UploadSimpleIcon className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground font-medium">
              Upload Poster (Auto-WebP)
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

      <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="rounded-none h-9 text-xs sm:text-sm cursor-pointer"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading || isCompressing}
          className="rounded-none h-9 text-xs sm:text-sm cursor-pointer"
        >
          {loading ? (
            <>
              <SpinnerIcon className="mr-2 h-3.5 w-3.5 animate-spin" />{" "}
              Saving...
            </>
          ) : isCompressing ? (
            "Processing..."
          ) : initialData ? (
            "Update Event"
          ) : (
            "Create Event"
          )}
        </Button>
      </div>
    </form>
  );
}
