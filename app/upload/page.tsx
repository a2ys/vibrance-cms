"use client";

import React, { useState } from "react";
import { CMSLayout } from "@/components/cms/cms-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ImageSquareIcon,
  VideoCameraIcon,
  UploadSimpleIcon,
  XIcon,
  EyeIcon,
  InfoIcon,
  SpinnerIcon,
  CheckCircleIcon,
  DownloadSimpleIcon,
} from "@phosphor-icons/react";
import { API_URL } from "@/lib/config";
import { compressImage } from "@/lib/utils";
import Link from "next/link";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

type MediaType = "photos" | "videos";

interface UploadedFile {
  name: string;
  size: number;
  path: string;
  type: MediaType;
}

export default function UploadMediaPage() {
  const [activeTab, setActiveTab] = useState<MediaType>("photos");

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [statusMessage, setStatusMessage] = useState("");

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [previewMedia, setPreviewMedia] = useState<UploadedFile | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);

      const filteredFiles = newFiles.filter((file) => {
        if (activeTab === "photos") return file.type.startsWith("image/");
        if (activeTab === "videos") return file.type.startsWith("video/");
        return false;
      });

      setSelectedFiles((prev) => [...prev, ...filteredFiles]);
      e.target.value = "";
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAllFiles = () => {
    setSelectedFiles([]);
    setProgress({ current: 0, total: 0 });
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsProcessing(true);
    setProgress({ current: 0, total: selectedFiles.length });

    let successCount = 0;

    for (let i = 0; i < selectedFiles.length; i++) {
      const originalFile = selectedFiles[i];
      let fileToUpload = originalFile;

      try {
        if (activeTab === "photos") {
          setStatusMessage(`Compressing ${originalFile.name}...`);
          await new Promise((r) => setTimeout(r, 50));
          try {
            fileToUpload = await compressImage(originalFile);
          } catch (err) {
            console.warn("Compression failed, using original.", err);
          }
        }

        setStatusMessage(`Uploading ${fileToUpload.name}...`);

        const formData = new FormData();
        formData.append("file", fileToUpload);
        formData.append("folder", activeTab);

        const res = await fetch(`${API_URL}/media`, {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          successCount++;

          setUploadedFiles((prev) => [
            {
              name: originalFile.name,
              size: fileToUpload.size,
              path: data.key || data.path,
              type: activeTab,
            },
            ...prev,
          ]);
        }
      } catch (error) {
        console.error(`Error processing ${originalFile.name}`, error);
      }

      setProgress({ current: i + 1, total: selectedFiles.length });
    }

    setIsProcessing(false);
    setStatusMessage("");

    if (successCount === selectedFiles.length) {
      setSelectedFiles([]);
    } else {
      alert(`Complete. ${successCount}/${selectedFiles.length} successful.`);
      setSelectedFiles([]);
    }
  };

  const filteredUploadedFiles = uploadedFiles.filter(
    (f) => f.type === activeTab,
  );

  return (
    <CMSLayout
      title="Upload Media"
      description="Upload photos and videos to your R2 storage"
      actions={
        <Link href="/media">
          <Button
            variant="outline"
            className="rounded-none bg-white hover:bg-zinc-50 border-zinc-200"
          >
            <EyeIcon className="mr-2 h-4 w-4" />
            Browse Media
          </Button>
        </Link>
      }
    >
      <div className="bg-zinc-50 min-h-screen">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-none border-zinc-200 bg-white shadow-sm h-fit">
              <CardHeader className="border-b border-zinc-100 pb-4">
                <CardTitle>Upload New Media</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Select files to upload. Bulk upload supported.
                </p>
              </CardHeader>
              <CardContent className="pt-6">
                <Tabs
                  value={activeTab}
                  onValueChange={(v) => {
                    setActiveTab(v as MediaType);
                    setSelectedFiles([]);
                  }}
                >
                  <TabsList className="grid w-full grid-cols-2 rounded-none bg-zinc-100 p-1 mb-6">
                    <TabsTrigger
                      value="photos"
                      className="gap-2 rounded-none data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      <ImageSquareIcon className="h-4 w-4" />
                      Photos
                    </TabsTrigger>
                    <TabsTrigger
                      value="videos"
                      className="gap-2 rounded-none data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      <VideoCameraIcon className="h-4 w-4" />
                      Videos
                    </TabsTrigger>
                  </TabsList>

                  <div className="mt-4">
                    <label
                      className={`flex flex-col items-center justify-center border-2 border-dashed p-8 transition-colors cursor-pointer bg-zinc-50/50 rounded-none ${isProcessing ? "opacity-50 pointer-events-none" : "hover:bg-zinc-50 hover:border-zinc-400 border-zinc-300"}`}
                    >
                      <UploadSimpleIcon className="mb-2 h-8 w-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground font-medium">
                        Click to select {activeTab}
                      </span>
                      <span className="text-xs text-muted-foreground mt-1">
                        {activeTab === "photos"
                          ? "Auto-converted to WebP"
                          : "Original quality upload"}
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        multiple
                        accept={activeTab === "photos" ? "image/*" : "video/*"}
                        onChange={handleFileChange}
                        disabled={isProcessing}
                      />
                    </label>
                  </div>

                  {selectedFiles.length > 0 && (
                    <div className="mt-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">
                          Selected Files ({selectedFiles.length})
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearAllFiles}
                          disabled={isProcessing}
                          className="text-destructive hover:text-destructive h-8 px-2"
                        >
                          Clear All
                        </Button>
                      </div>

                      <div className="grid gap-2 max-h-75 overflow-y-auto pr-2 border border-zinc-100 bg-zinc-50 p-2">
                        {selectedFiles.map((file, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between bg-white border border-zinc-200 p-2 text-sm"
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="h-8 w-8 bg-zinc-100 flex items-center justify-center shrink-0">
                                {activeTab === "photos" ? (
                                  <ImageSquareIcon className="text-zinc-400" />
                                ) : (
                                  <VideoCameraIcon className="text-zinc-400" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate font-medium text-zinc-700">
                                  {file.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {(file.size / 1024).toFixed(1)} KB
                                </p>
                              </div>
                            </div>
                            {!isProcessing && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeFile(idx)}
                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                              >
                                <XIcon className="h-4 w-4" />
                              </Button>
                            )}
                            {isProcessing && idx < progress.current && (
                              <CheckCircleIcon className="h-5 w-5 text-green-500" />
                            )}
                            {isProcessing && idx === progress.current && (
                              <SpinnerIcon className="h-4 w-4 animate-spin text-zinc-500" />
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2">
                        {isProcessing && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>{statusMessage}</span>
                              <span>
                                {Math.round(
                                  (progress.current / progress.total) * 100,
                                )}
                                %
                              </span>
                            </div>
                            <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-zinc-900 h-full transition-all duration-300"
                                style={{
                                  width: `${(progress.current / progress.total) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}

                        <Button
                          onClick={handleUpload}
                          disabled={isProcessing}
                          className="w-full rounded-none"
                        >
                          {isProcessing
                            ? "Processing..."
                            : `Upload ${selectedFiles.length} Files`}
                        </Button>
                      </div>
                    </div>
                  )}
                </Tabs>
              </CardContent>
            </Card>

            {filteredUploadedFiles.length > 0 && (
              <Card className="rounded-none border-zinc-200 bg-white shadow-sm">
                <CardHeader className="border-b border-zinc-100 pb-4">
                  <CardTitle>Session Uploads</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredUploadedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="group relative border border-zinc-200 bg-zinc-50"
                      >
                        <div className="aspect-square bg-zinc-100 flex items-center justify-center relative overflow-hidden">
                          {file.type === "photos" ? (
                            <img
                              src={`${API_URL}/${file.path}`}
                              alt={file.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <VideoCameraIcon className="h-8 w-8 text-muted-foreground" />
                          )}
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                              size="sm"
                              variant="secondary"
                              className="rounded-none h-8"
                              onClick={() => setPreviewMedia(file)}
                            >
                              <EyeIcon className="mr-1 h-3 w-3" /> Preview
                            </Button>
                          </div>
                        </div>
                        <div className="p-2 bg-white border-t border-zinc-200">
                          <p className="text-xs truncate font-medium">
                            {file.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="rounded-none border-zinc-200 bg-white shadow-sm h-fit">
              <CardHeader className="border-b border-zinc-100 pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <InfoIcon className="h-5 w-5" />
                  Info
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4 text-sm text-muted-foreground">
                <ul className="list-disc pl-4 space-y-2">
                  <li>
                    <strong>Photos:</strong> Automatically converted to WebP
                    (80% quality) to save space.
                  </li>
                  <li>
                    <strong>Videos:</strong> Uploaded in original quality.
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        <Dialog
          open={previewMedia !== null}
          onOpenChange={() => setPreviewMedia(null)}
        >
          <DialogContent
            className="max-w-6xl h-[85vh] p-0 gap-0 rounded-none border-zinc-800 bg-zinc-950 flex flex-col overflow-hidden focus:outline-none [&>button]:hidden"
            aria-describedby={undefined}
          >
            {previewMedia && (
              <>
                <DialogTitle className="sr-only">
                  Preview: {previewMedia.name}
                </DialogTitle>

                <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-1.5 bg-zinc-800 rounded-sm">
                      {previewMedia.type === "videos" ? (
                        <VideoCameraIcon className="h-4 w-4 text-zinc-400" />
                      ) : (
                        <ImageSquareIcon className="h-4 w-4 text-zinc-400" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-zinc-200 truncate font-mono">
                      {previewMedia.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <a
                      href={`${API_URL}/${previewMedia.path}`}
                      download={previewMedia.name}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-none"
                      >
                        <DownloadSimpleIcon className="h-4 w-4" />
                      </Button>
                    </a>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setPreviewMedia(null)}
                      className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-none"
                    >
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex-1 relative flex items-center justify-center bg-black/40 p-4 overflow-hidden">
                  {previewMedia.type === "videos" ||
                  previewMedia.path.endsWith(".mp4") ? (
                    <video
                      src={`${API_URL}/${previewMedia.path}`}
                      controls
                      autoPlay
                      className="max-h-full max-w-full object-contain shadow-2xl"
                    />
                  ) : (
                    <img
                      src={`${API_URL}/${previewMedia.path}`}
                      alt="Preview"
                      className="max-h-full max-w-full object-contain shadow-2xl"
                    />
                  )}
                </div>

                <div className="flex items-center gap-6 px-4 py-2 border-t border-zinc-800 bg-zinc-900/50 text-xs text-zinc-500">
                  <div className="flex items-center gap-2">
                    <InfoIcon className="h-3.5 w-3.5" />
                    <span>File Details</span>
                  </div>
                  <div className="h-3 w-px bg-zinc-800" />
                  <span>Size: {(previewMedia.size / 1024).toFixed(1)} KB</span>
                  <div className="h-3 w-px bg-zinc-800" />
                  <span>Status: Uploaded just now</span>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </CMSLayout>
  );
}
