"use client";

import { useState, useRef } from "react";
import { CMSLayout } from "@/components/cms/cms-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  UploadSimpleIcon,
  FileCsvIcon,
  WarningCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  SpinnerIcon,
  MicrosoftExcelLogoIcon,
} from "@phosphor-icons/react";
import { API_URL } from "@/lib/config";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";

interface EventCSVRow {
  event_name: string;
  club_name: string;
  event_type: string;
  event_for: string;
  poster_path: string;
  start_date_time: string;
  end_date_time: string;
  price_per_person: string;
  participation_type: string;
  event_venue: string;
  short_description: string;
  long_description: string;
  is_special_event: string;
  registration_link: string;
  team_size: string;
}

interface ImportLog {
  row: number;
  name: string;
  status: "success" | "error";
  message: string;
}

interface APIResponse {
  success?: boolean;
  error?: string;
  details?: string;
  id?: number;
}

export default function ImportEventsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<ImportLog[]>([]);
  const [totalProcessed, setTotalProcessed] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setLogs([]);
      setProgress(0);
      setTotalProcessed(0);
    }
  };

  const parseFile = (file: File): Promise<EventCSVRow[]> => {
    return new Promise((resolve, reject) => {
      const isExcel = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");

      if (isExcel) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json<EventCSVRow>(sheet, {
              defval: "",
            });
            resolve(jsonData);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
      } else {
        Papa.parse<EventCSVRow>(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            resolve(results.data);
          },
          error: (error) => {
            reject(error);
          },
        });
      }
    });
  };

  const processImport = async () => {
    if (!file) return;

    setUploading(true);
    setLogs([]);
    setProgress(0);

    try {
      const rows = await parseFile(file);
      const total = rows.length;
      let completed = 0;

      for (let i = 0; i < total; i++) {
        const row = rows[i];

        if (!row.event_name) {
          completed++;
          continue;
        }

        try {
          const payload = {
            event_name: row.event_name,
            club_name: row.club_name,
            event_type: row.event_type,
            event_for: row.event_for,
            poster_path: row.poster_path,
            start_date_time: row.start_date_time,
            end_date_time: row.end_date_time,
            price_per_person: Number(row.price_per_person) || 0,
            participation_type: row.participation_type,
            event_venue: row.event_venue,
            short_description: row.short_description,
            long_description: row.long_description,
            is_special_event:
              String(row.is_special_event).toLowerCase() === "true" ||
              String(row.is_special_event) === "1",
            registration_link: row.registration_link,
            team_size: Number(row.team_size) || 1,
          };

          const response = await fetch(`${API_URL}/events`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });

          const result = (await response.json()) as APIResponse;

          if (!response.ok) {
            throw new Error(result.details || result.error || "Unknown error");
          }

          setLogs((prev) => [
            {
              row: i + 1,
              name: row.event_name,
              status: "success",
              message: "Created successfully",
            },
            ...prev,
          ]);
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "An unexpected error occurred";

          setLogs((prev) => [
            {
              row: i + 1,
              name: row.event_name,
              status: "error",
              message: errorMessage,
            },
            ...prev,
          ]);
        } finally {
          completed++;
          setTotalProcessed(completed);
          const percentage = Math.round((completed / total) * 100);
          setProgress(percentage);
        }
      }
    } catch {
      setLogs((prev) => [
        {
          row: 0,
          name: "FILE PARSE",
          status: "error",
          message: "Failed to parse file",
        },
        ...prev,
      ]);
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const isExcelFile =
    file?.name.endsWith(".xlsx") || file?.name.endsWith(".xls");

  return (
    <CMSLayout
      title="Import Events"
      description="Bulk upload events via CSV or Excel"
      actions={
        <Link href="/events">
          <Button
            variant="outline"
            className="rounded-none h-8 text-xs sm:text-sm"
          >
            Back to Events
          </Button>
        </Link>
      }
    >
      <div className="bg-zinc-50 p-3 sm:p-4 min-h-[calc(100vh-100px)]">
        <div className="max-w-3xl mx-auto space-y-4">
          <Card className="rounded-none border-zinc-200 shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-lg">Select File</CardTitle>
              <CardDescription>
                Upload a CSV or Excel (.xlsx) file matching the database
                columns.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                onClick={!uploading ? triggerFileInput : undefined}
                className={`border-2 border-dashed border-zinc-200 bg-zinc-50 p-8 flex flex-col items-center justify-center text-center transition-colors ${!uploading ? "cursor-pointer hover:bg-zinc-100 hover:border-zinc-300" : "opacity-50 cursor-not-allowed"}`}
              >
                <input
                  type="file"
                  accept=".csv, .xlsx, .xls"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  disabled={uploading}
                />
                <div className="bg-white p-3 border border-zinc-200 mb-3">
                  {isExcelFile ? (
                    <MicrosoftExcelLogoIcon className="h-8 w-8 text-green-600" />
                  ) : (
                    <FileCsvIcon className="h-8 w-8 text-zinc-600" />
                  )}
                </div>
                {file ? (
                  <div>
                    <p className="font-medium text-sm">{file.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium">Click to upload</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      CSV or Excel files accepted
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button
                  disabled={!file || uploading}
                  onClick={processImport}
                  className="rounded-none w-full sm:w-auto"
                >
                  {uploading ? (
                    <>
                      <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <UploadSimpleIcon className="mr-2 h-4 w-4" />
                      Start Import
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {(uploading || progress > 0) && (
            <Card className="rounded-none border-zinc-200 shadow-sm bg-white animate-in fade-in slide-in-from-bottom-2">
              <CardContent className="p-6 space-y-4">
                {uploading && (
                  <Alert
                    variant="destructive"
                    className="rounded-none border-amber-200 bg-amber-50 text-amber-900"
                  >
                    <WarningCircleIcon className="h-4 w-4 text-amber-900" />
                    <AlertTitle>Do not close this page</AlertTitle>
                    <AlertDescription>
                      Events are being uploaded. Closing this tab will interrupt
                      the process.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Progress</span>
                    <span className="text-muted-foreground">{progress}%</span>
                  </div>
                  <div className="h-4 w-full bg-zinc-100 border border-zinc-100">
                    <div
                      className="h-full bg-zinc-900 transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center pt-1">
                    Processed {totalProcessed} rows
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {logs.length > 0 && (
            <Card className="rounded-none border-zinc-200 shadow-sm bg-white">
              <CardHeader className="pb-3 border-b border-zinc-100">
                <CardTitle className="text-base">Import Log</CardTitle>
              </CardHeader>
              <div className="max-h-75 overflow-y-auto bg-zinc-50 p-0 text-sm">
                <table className="w-full text-left">
                  <thead className="bg-zinc-100 text-xs font-medium text-muted-foreground uppercase sticky top-0">
                    <tr>
                      <th className="px-4 py-2 w-20">Row</th>
                      <th className="px-4 py-2">Event Name</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {logs.map((log, idx) => (
                      <tr key={idx} className="bg-white">
                        <td className="px-4 py-2 font-mono text-xs text-muted-foreground">
                          {log.row}
                        </td>
                        <td className="px-4 py-2 font-medium">
                          {log.name || "Unknown"}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none text-xs font-medium ${
                              log.status === "success"
                                ? "bg-green-50 text-green-700 border border-green-100"
                                : "bg-red-50 text-red-700 border border-red-100"
                            }`}
                          >
                            {log.status === "success" ? (
                              <CheckCircleIcon className="w-3.5 h-3.5" />
                            ) : (
                              <XCircleIcon className="w-3.5 h-3.5" />
                            )}
                            {log.status === "success" ? "Created" : "Failed"}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right text-xs text-muted-foreground">
                          {log.message}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </div>
    </CMSLayout>
  );
}
