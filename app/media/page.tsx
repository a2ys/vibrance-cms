"use client";

import { useState, useEffect } from "react";
import { CMSLayout } from "@/components/cms/cms-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  FolderIcon,
  ImageSquareIcon,
  VideoCameraIcon,
  CaretRightIcon,
  HouseIcon,
  UploadSimpleIcon,
  TrashIcon,
  ArrowLeftIcon,
  DownloadSimpleIcon,
  XIcon,
  CheckCircleIcon,
  CircleIcon,
  ChecksIcon,
  SpinnerIcon,
} from "@phosphor-icons/react";
import { API_URL } from "@/lib/config";
import Link from "next/link";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
import JSZip from "jszip";
import { saveAs } from "file-saver";

interface MediaFile {
  key: string;
  url: string;
  size: number;
  uploaded: string;
}

interface FolderItem {
  name: string;
  path: string;
  icon?: React.ElementType;
  description?: string;
  subfolders?: FolderItem[];
}

const folderStructure: { root: { name: string; folders: FolderItem[] } } = {
  root: {
    name: "cms-assets",
    folders: [
      {
        name: "images",
        path: "images/",
        icon: ImageSquareIcon,
        subfolders: [
          {
            name: "posters",
            path: "images/posters/",
            description: "Event poster images",
            subfolders: [],
          },
          {
            name: "photos",
            path: "images/photos/",
            description: "General photos",
            subfolders: [],
          },
        ],
      },
      {
        name: "videos",
        path: "videos/",
        icon: VideoCameraIcon,
        subfolders: [],
        description: "Video content",
      },
    ],
  },
};

interface BreadcrumbItem {
  name: string;
  path: string;
}

export default function MediaBrowserPage() {
  const [currentPath, setCurrentPath] = useState<string>("");
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);

  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isBulkDownloading, setIsBulkDownloading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSelectedKeys(new Set());

    if (
      currentPath === "images/photos/" ||
      currentPath === "videos/" ||
      currentPath === "images/posters/"
    ) {
      fetchFiles(currentPath);
    } else {
      setFiles([]);
    }
  }, [currentPath]);

  const fetchFiles = async (prefix: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/media?prefix=${prefix}`);
      if (res.ok) {
        const data = await res.json();
        const cleanFiles = data.filter(
          (f: MediaFile) => f.key !== prefix && !f.key.endsWith("/"),
        );
        setFiles(cleanFiles);
      }
    } catch (error) {
      console.error("Failed to load media", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (key: string) => {
    const newSet = new Set(selectedKeys);
    if (newSet.has(key)) {
      newSet.delete(key);
    } else {
      newSet.add(key);
    }
    setSelectedKeys(newSet);
  };

  const handleSelectAll = () => {
    if (selectedKeys.size === files.length) {
      setSelectedKeys(new Set());
    } else {
      setSelectedKeys(new Set(files.map((f) => f.key)));
    }
  };

  const handleBulkDownload = async () => {
    if (selectedKeys.size === 0) return;
    setIsBulkDownloading(true);

    try {
      const selectedFiles = files.filter((f) => selectedKeys.has(f.key));

      if (selectedFiles.length === 1) {
        const file = selectedFiles[0];
        const response = await fetch(`${API_URL}${file.url}`);
        const blob = await response.blob();
        const fileName = file.key.split("/").pop() || "download";
        saveAs(blob, fileName);
      } else {
        const zip = new JSZip();

        const promises = selectedFiles.map(async (file) => {
          try {
            const response = await fetch(`${API_URL}${file.url}`);
            if (!response.ok) throw new Error("Network response was not ok");
            const blob = await response.blob();
            const fileName = file.key.split("/").pop() || "unknown";
            zip.file(fileName, blob);
          } catch (err) {
            console.error(`Failed to download ${file.key}`, err);
          }
        });

        await Promise.all(promises);

        const content = await zip.generateAsync({ type: "blob" });
        const folderName =
          currentPath.replace(/\/$/, "").split("/").pop() || "media";
        saveAs(content, `${folderName}-selected.zip`);
      }
    } catch (error) {
      console.error("Download failed", error);
      alert("Failed to download files.");
    } finally {
      setIsBulkDownloading(false);
    }
  };

  const executeDelete = async () => {
    setIsBulkDeleting(true);
    const keysToDelete = Array.from(selectedKeys);

    try {
      await Promise.all(
        keysToDelete.map((key) =>
          fetch(`${API_URL}/media?key=${encodeURIComponent(key)}`, {
            method: "DELETE",
          }),
        ),
      );

      setFiles((prev) => prev.filter((f) => !selectedKeys.has(f.key)));
      setSelectedKeys(new Set());
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Bulk delete error", error);
      alert("Some files failed to delete.");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const navigateToFolder = (folderName: string, folderPath: string) => {
    setCurrentPath(folderPath);
    setBreadcrumbs((prev) => [...prev, { name: folderName, path: folderPath }]);
  };

  const navigateToRoot = () => {
    setCurrentPath("");
    setBreadcrumbs([]);
  };

  const navigateToBreadcrumb = (index: number) => {
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);
    setCurrentPath(newBreadcrumbs[newBreadcrumbs.length - 1]?.path || "");
  };

  const handleBack = () => {
    if (breadcrumbs.length <= 1) {
      navigateToRoot();
    } else {
      navigateToBreadcrumb(breadcrumbs.length - 2);
    }
  };

  const getCurrentFolderContents = () => {
    if (!currentPath) {
      return { folders: folderStructure.root.folders };
    }
    for (const folder of folderStructure.root.folders) {
      if (currentPath === folder.path) {
        return { folders: folder.subfolders || [] };
      }
    }
    return { folders: [] };
  };

  const { folders } = getCurrentFolderContents();
  const isLeafFolder = folders.length === 0 && currentPath !== "";

  return (
    <CMSLayout
      title="Media Browser"
      description="Browse your R2 storage folders"
      actions={
        <div className="flex items-center gap-2">
          {selectedKeys.size > 0 && (
            <>
              <Button
                variant="outline"
                className="rounded-none bg-white animate-in fade-in zoom-in"
                onClick={handleBulkDownload}
                disabled={isBulkDownloading || isBulkDeleting}
              >
                {isBulkDownloading ? (
                  <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <DownloadSimpleIcon className="mr-2 h-4 w-4" />
                )}
                {isBulkDownloading
                  ? "Processing..."
                  : `Download (${selectedKeys.size})`}
              </Button>

              <Button
                variant="destructive"
                className="rounded-none animate-in fade-in zoom-in"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isBulkDownloading || isBulkDeleting}
              >
                <TrashIcon className="mr-2 h-4 w-4" />
                Delete ({selectedKeys.size})
              </Button>
            </>
          )}
          <Link href="/upload">
            <Button className="rounded-none" disabled={isBulkDownloading}>
              <UploadSimpleIcon className="mr-2 h-4 w-4" />
              Upload Media
            </Button>
          </Link>
        </div>
      }
    >
      <div className="bg-zinc-50 min-h-screen">
        <Card className="mb-6 rounded-none border-zinc-200 bg-white shadow-sm">
          <CardContent className="py-3 flex items-center justify-between gap-2">
            {/* Left: Breadcrumbs */}
            <div className="flex items-center gap-2">
              {currentPath && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleBack}
                  className="h-7 w-7 rounded-none border-zinc-200 mr-2"
                  title="Go Back"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                </Button>
              )}

              <div className="flex items-center gap-2 text-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={navigateToRoot}
                  className="h-7 px-2 rounded-none hover:bg-zinc-100 text-zinc-500"
                >
                  <HouseIcon className="h-4 w-4" />
                </Button>

                {breadcrumbs.length > 0 && (
                  <span className="text-zinc-300">/</span>
                )}

                {breadcrumbs.map((item, index) => (
                  <div key={item.path} className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigateToBreadcrumb(index)}
                      className={`h-7 px-2 rounded-none hover:bg-zinc-100 ${
                        index === breadcrumbs.length - 1
                          ? "font-semibold text-foreground bg-zinc-50"
                          : "text-muted-foreground"
                      }`}
                    >
                      {item.name}
                    </Button>
                    {index < breadcrumbs.length - 1 && (
                      <CaretRightIcon className="h-3 w-3 text-zinc-300" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {isLeafFolder && files.length > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                  className="h-7 text-xs text-muted-foreground hover:text-foreground rounded-none"
                >
                  <ChecksIcon className="mr-2 h-3 w-3" />
                  {selectedKeys.size === files.length
                    ? "Deselect All"
                    : "Select All"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {folders.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {folders.map((folder) => {
              const Icon = folder.icon || FolderIcon;
              return (
                <Card
                  key={folder.path}
                  className="cursor-pointer transition-all hover:bg-zinc-50 hover:border-zinc-300 rounded-none border-zinc-200 bg-white shadow-sm"
                  onClick={() => navigateToFolder(folder.name, folder.path)}
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex h-12 w-12 items-center justify-center bg-zinc-100 border border-zinc-200 rounded-none">
                      <Icon className="h-6 w-6 text-zinc-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">
                        {folder.name}
                      </h3>
                      {folder.description && (
                        <p className="text-sm text-muted-foreground">
                          {folder.description}
                        </p>
                      )}
                      {folder.subfolders && folder.subfolders.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {folder.subfolders.length} subfolder(s)
                        </p>
                      )}
                    </div>
                    <CaretRightIcon className="h-5 w-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {isLeafFolder && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Files</h2>
              <span className="text-sm text-muted-foreground">
                {files.length} items
              </span>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <p className="text-muted-foreground animate-pulse">
                  Loading files...
                </p>
              </div>
            ) : files.length === 0 ? (
              <div className="border border-zinc-200 bg-white p-12 text-center rounded-none">
                <p className="text-muted-foreground">No files found here.</p>
                <Link href="/upload" className="mt-4 inline-block">
                  <Button variant="outline" className="rounded-none">
                    Upload New
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                {files.map((file) => {
                  const isSelected = selectedKeys.has(file.key);
                  return (
                    <Card
                      key={file.key}
                      className={`group relative rounded-none border shadow-sm overflow-hidden transition-all ${
                        isSelected
                          ? "border-blue-500 ring-1 ring-blue-500 bg-blue-50/10"
                          : "border-zinc-200 bg-white"
                      }`}
                      onClick={() => toggleSelection(file.key)}
                    >
                      {/* Selection Checkbox */}
                      <div className="absolute top-2 left-2 z-10">
                        {isSelected ? (
                          <CheckCircleIcon
                            weight="fill"
                            className="h-6 w-6 text-blue-500 bg-white rounded-full"
                          />
                        ) : (
                          <CircleIcon className="h-6 w-6 text-white drop-shadow-md opacity-70 group-hover:opacity-100" />
                        )}
                      </div>

                      <div className="aspect-square w-full bg-zinc-100 relative overflow-hidden">
                        {file.key.endsWith(".mp4") ||
                        file.key.includes("videos/") ? (
                          <div className="w-full h-full flex items-center justify-center bg-black">
                            <VideoCameraIcon className="h-12 w-12 text-white opacity-50" />
                            <video
                              src={`${API_URL}${file.url}`}
                              className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none"
                            />
                          </div>
                        ) : (
                          <img
                            src={`${API_URL}${file.url}`}
                            alt={file.key}
                            className={`h-full w-full object-cover transition-transform ${isSelected ? "scale-95" : "group-hover:scale-105"}`}
                          />
                        )}

                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button
                            size="icon"
                            variant="secondary"
                            className="h-8 w-8 rounded-none"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMedia(file);
                            }}
                          >
                            <ImageSquareIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="p-3">
                        <p
                          className="text-xs font-medium truncate"
                          title={file.key}
                        >
                          {file.key.split("/").pop()}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <Dialog
          open={selectedMedia !== null}
          onOpenChange={() => setSelectedMedia(null)}
        >
          <DialogContent className="max-w-6xl h-[85vh] p-0 gap-0 rounded-none border-zinc-800 bg-zinc-950 flex flex-col overflow-hidden focus:outline-none [&>button]:hidden">
            {selectedMedia && (
              <>
                <DialogTitle className="sr-only">
                  Media Preview: {selectedMedia.key}
                </DialogTitle>

                <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-1.5 bg-zinc-800 rounded-sm">
                      {selectedMedia.key.endsWith(".mp4") ? (
                        <VideoCameraIcon className="h-4 w-4 text-zinc-400" />
                      ) : (
                        <ImageSquareIcon className="h-4 w-4 text-zinc-400" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-zinc-200 truncate font-mono">
                      {selectedMedia.key.split("/").pop()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedMedia(null)}
                      className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-none"
                    >
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex-1 relative flex items-center justify-center bg-black/40 p-4 overflow-hidden">
                  {selectedMedia.key.endsWith(".mp4") ||
                  selectedMedia.key.includes("videos/") ? (
                    <video
                      src={`${API_URL}${selectedMedia.url}`}
                      controls
                      autoPlay
                      className="max-h-full max-w-full object-contain shadow-2xl"
                    />
                  ) : (
                    <img
                      src={`${API_URL}${selectedMedia.url}`}
                      alt="Preview"
                      className="max-h-full max-w-full object-contain shadow-2xl"
                    />
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        <AlertDialog
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
        >
          <AlertDialogContent className="rounded-none border-zinc-200 bg-white shadow-lg">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Selected Files?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete{" "}
                <span className="font-bold text-zinc-900">
                  {selectedKeys.size} files
                </span>
                ? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                disabled={isBulkDeleting}
                className="rounded-none border-zinc-200 bg-white hover:bg-zinc-50"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  executeDelete();
                }}
                disabled={isBulkDeleting}
                className="rounded-none bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isBulkDeleting ? "Deleting..." : "Delete All"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </CMSLayout>
  );
}
