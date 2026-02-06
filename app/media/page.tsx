"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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

function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse bg-zinc-200 ${className}`} />;
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

  const fetchFiles = useCallback(async (prefix: string) => {
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
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

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
  }, [currentPath, fetchFiles]);

  const toggleSelection = useCallback((key: string) => {
    setSelectedKeys((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedKeys((prev) => {
      if (prev.size === files.length) {
        return new Set();
      } else {
        return new Set(files.map((f) => f.key));
      }
    });
  }, [files]);

  const handleBulkDownload = useCallback(async () => {
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
            console.error(err);
          }
        });

        await Promise.all(promises);
        const content = await zip.generateAsync({ type: "blob" });
        const folderName =
          currentPath.replace(/\/$/, "").split("/").pop() || "media";
        saveAs(content, `${folderName}-selected.zip`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsBulkDownloading(false);
    }
  }, [files, selectedKeys, currentPath]);

  const executeDelete = useCallback(async () => {
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
      console.error(error);
    } finally {
      setIsBulkDeleting(false);
    }
  }, [selectedKeys]);

  const navigateToFolder = useCallback(
    (folderName: string, folderPath: string) => {
      setCurrentPath(folderPath);
      setBreadcrumbs((prev) => [
        ...prev,
        { name: folderName, path: folderPath },
      ]);
    },
    [],
  );

  const navigateToRoot = useCallback(() => {
    setCurrentPath("");
    setBreadcrumbs([]);
  }, []);

  const navigateToBreadcrumb = useCallback(
    (index: number) => {
      const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
      setBreadcrumbs(newBreadcrumbs);
      setCurrentPath(newBreadcrumbs[newBreadcrumbs.length - 1]?.path || "");
    },
    [breadcrumbs],
  );

  const handleBack = useCallback(() => {
    if (breadcrumbs.length <= 1) {
      navigateToRoot();
    } else {
      navigateToBreadcrumb(breadcrumbs.length - 2);
    }
  }, [breadcrumbs.length, navigateToRoot, navigateToBreadcrumb]);

  const { folders } = useMemo(() => {
    if (!currentPath) {
      return { folders: folderStructure.root.folders };
    }
    for (const folder of folderStructure.root.folders) {
      if (currentPath === folder.path) {
        return { folders: folder.subfolders || [] };
      }
    }
    return { folders: [] };
  }, [currentPath]);

  const isLeafFolder = folders.length === 0 && currentPath !== "";

  return (
    <CMSLayout
      title="Media Browser"
      description="Browse your R2 storage folders"
      actions={
        <div className="flex items-center gap-1">
          {selectedKeys.size > 0 && (
            <>
              <Button
                variant="outline"
                className="rounded-none bg-white animate-in fade-in zoom-in h-7 text-xs cursor-pointer px-2"
                onClick={handleBulkDownload}
                disabled={isBulkDownloading || isBulkDeleting}
              >
                {isBulkDownloading ? (
                  <SpinnerIcon className="mr-1.5 h-3 w-3 animate-spin" />
                ) : (
                  <DownloadSimpleIcon className="mr-1.5 h-3 w-3" />
                )}
                {isBulkDownloading
                  ? "Processing..."
                  : `Download (${selectedKeys.size})`}
              </Button>

              <Button
                variant="destructive"
                className="rounded-none animate-in fade-in zoom-in h-7 text-xs cursor-pointer px-2"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isBulkDownloading || isBulkDeleting}
              >
                <TrashIcon className="mr-1.5 h-3 w-3" />
                Delete ({selectedKeys.size})
              </Button>
            </>
          )}
          <Link href="/upload" className="cursor-pointer">
            <Button
              className="rounded-none h-7 text-xs cursor-pointer px-2"
              disabled={isBulkDownloading}
            >
              <UploadSimpleIcon className="mr-1.5 h-3 w-3" />
              Upload Media
            </Button>
          </Link>
        </div>
      }
    >
      <div className="bg-zinc-50 p-2">
        <Card className="mb-2 rounded-none border-zinc-200 bg-white shadow-sm p-0">
          <CardContent className="p-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {currentPath && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleBack}
                  className="h-6 w-6 rounded-none border-zinc-200 mr-1 cursor-pointer"
                  title="Go Back"
                >
                  <ArrowLeftIcon className="h-3 w-3" />
                </Button>
              )}

              <div className="flex items-center gap-1 text-xs">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={navigateToRoot}
                  className="h-6 px-1.5 rounded-none hover:bg-zinc-100 text-zinc-500 cursor-pointer"
                >
                  <HouseIcon className="h-3.5 w-3.5" />
                </Button>

                {breadcrumbs.length > 0 && (
                  <span className="text-zinc-300">/</span>
                )}

                {breadcrumbs.map((item, index) => (
                  <div key={item.path} className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigateToBreadcrumb(index)}
                      className={`h-6 px-1.5 rounded-none hover:bg-zinc-100 cursor-pointer ${
                        index === breadcrumbs.length - 1
                          ? "font-semibold text-foreground bg-zinc-50"
                          : "text-muted-foreground"
                      }`}
                    >
                      {item.name}
                    </Button>
                    {index < breadcrumbs.length - 1 && (
                      <CaretRightIcon className="h-2.5 w-2.5 text-zinc-300" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {isLeafFolder && files.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                className="h-6 text-[10px] text-muted-foreground hover:text-foreground rounded-none cursor-pointer px-2"
              >
                <ChecksIcon className="mr-1.5 h-3 w-3" />
                {selectedKeys.size === files.length
                  ? "Deselect All"
                  : "Select All"}
              </Button>
            )}
          </CardContent>
        </Card>

        {folders.length > 0 && (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {folders.map((folder) => {
              const Icon = folder.icon || FolderIcon;
              return (
                <Card
                  key={folder.path}
                  className="cursor-pointer transition-all hover:bg-zinc-50 hover:border-zinc-300 rounded-none border-zinc-200 bg-white shadow-sm p-0"
                  onClick={() => navigateToFolder(folder.name, folder.path)}
                >
                  <CardContent className="flex items-center gap-2 p-2">
                    <div className="flex h-8 w-8 items-center justify-center bg-zinc-100 border border-zinc-200 rounded-none shrink-0">
                      <Icon className="h-4 w-4 text-zinc-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground text-xs truncate">
                        {folder.name}
                      </h3>
                      {folder.description && (
                        <p className="text-[10px] text-muted-foreground truncate">
                          {folder.description}
                        </p>
                      )}
                    </div>
                    <CaretRightIcon className="h-3 w-3 text-muted-foreground shrink-0" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {isLeafFolder && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-medium">Files</h2>
              <span className="text-[10px] text-muted-foreground">
                {files.length} items
              </span>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="aspect-square border border-zinc-200 bg-white p-2"
                  >
                    <Skeleton className="w-full h-full" />
                  </div>
                ))}
              </div>
            ) : files.length === 0 ? (
              <div className="border border-zinc-200 bg-white p-6 text-center rounded-none">
                <p className="text-xs text-muted-foreground">
                  No files found here.
                </p>
                <Link
                  href="/upload"
                  className="mt-2 inline-block cursor-pointer"
                >
                  <Button
                    variant="outline"
                    className="rounded-none h-7 text-[10px] cursor-pointer"
                  >
                    Upload New
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
                {files.map((file) => {
                  const isSelected = selectedKeys.has(file.key);
                  return (
                    <Card
                      key={file.key}
                      className={`group relative rounded-none border shadow-sm overflow-hidden transition-all cursor-pointer ${
                        isSelected
                          ? "border-blue-500 ring-1 ring-blue-500 bg-blue-50/10"
                          : "border-zinc-200 bg-white"
                      }`}
                      onClick={() => toggleSelection(file.key)}
                    >
                      <div className="absolute top-1.5 left-1.5 z-10">
                        {isSelected ? (
                          <CheckCircleIcon
                            weight="fill"
                            className="h-4 w-4 text-blue-500 bg-white rounded-full"
                          />
                        ) : (
                          <CircleIcon className="h-4 w-4 text-white drop-shadow-md opacity-70 group-hover:opacity-100" />
                        )}
                      </div>

                      <div className="aspect-square w-full bg-zinc-100 relative overflow-hidden">
                        {file.key.endsWith(".mp4") ||
                        file.key.includes("videos/") ? (
                          <div className="w-full h-full flex items-center justify-center bg-black">
                            <VideoCameraIcon className="h-8 w-8 text-white opacity-50" />
                            <video
                              src={`${API_URL}${file.url}`}
                              className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none"
                            />
                          </div>
                        ) : (
                          <img
                            src={`${API_URL}${file.url}`}
                            alt={file.key}
                            className={`h-full w-full object-cover transition-transform ${
                              isSelected && "scale-95"
                            }`}
                          />
                        )}

                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button
                            size="icon"
                            variant="secondary"
                            className="h-6 w-6 rounded-none cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMedia(file);
                            }}
                          >
                            <ImageSquareIcon className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="p-1.5">
                        <p
                          className="text-[10px] font-medium truncate"
                          title={file.key}
                        >
                          {file.key.split("/").pop()}
                        </p>
                        <p className="text-[9px] text-muted-foreground mt-0.5">
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
          <DialogContent className="max-w-4xl h-[80vh] p-0 gap-0 rounded-none border-zinc-800 bg-zinc-950 flex flex-col overflow-hidden focus:outline-none [&>button]:hidden">
            {selectedMedia && (
              <>
                <DialogTitle className="sr-only">
                  Media Preview: {selectedMedia.key}
                </DialogTitle>

                <div className="flex items-center justify-between px-3 py-1.5 border-b border-zinc-800 bg-zinc-900/50">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="p-0.5 bg-zinc-800 rounded-sm">
                      {selectedMedia.key.endsWith(".mp4") ? (
                        <VideoCameraIcon className="h-3 w-3 text-zinc-400" />
                      ) : (
                        <ImageSquareIcon className="h-3 w-3 text-zinc-400" />
                      )}
                    </div>
                    <span className="text-[10px] font-medium text-zinc-200 truncate font-mono">
                      {selectedMedia.key.split("/").pop()}
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedMedia(null)}
                    className="h-6 w-6 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-none cursor-pointer"
                  >
                    <XIcon className="h-3 w-3" />
                  </Button>
                </div>

                <div className="flex-1 relative flex items-center justify-center bg-black/40 p-2 overflow-hidden">
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
          <AlertDialogContent className="rounded-none border-zinc-200 bg-white shadow-lg p-4 max-w-sm">
            <AlertDialogHeader className="space-y-1">
              <AlertDialogTitle className="text-sm">
                Delete Selected Files?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs">
                Are you sure you want to delete{" "}
                <span className="font-bold text-zinc-900">
                  {selectedKeys.size} files
                </span>
                ? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-3">
              <AlertDialogCancel
                disabled={isBulkDeleting}
                className="rounded-none border-zinc-200 bg-white hover:bg-zinc-50 h-7 text-xs cursor-pointer"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  executeDelete();
                }}
                disabled={isBulkDeleting}
                className="rounded-none bg-destructive text-destructive-foreground hover:bg-destructive/90 h-7 text-xs cursor-pointer"
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
