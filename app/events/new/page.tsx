"use client";

import { CMSLayout } from "@/components/cms/cms-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { EventForm } from "@/components/cms/event-form";

export default function NewEventPage() {
  return (
    <CMSLayout
      title="Create Event"
      description="Add a new event to your club calendar"
      actions={
        <Link href="/events" className="cursor-pointer">
          <Button
            variant="outline"
            className="rounded-none bg-white hover:bg-zinc-50 border-zinc-200 h-7 text-xs cursor-pointer px-2"
          >
            <ArrowLeftIcon className="mr-1.5 h-3 w-3" />
            Back to Events
          </Button>
        </Link>
      }
    >
      <div className="bg-zinc-50 p-2">
        <Card className="max-w-3xl rounded-none border-zinc-200 bg-white shadow-sm h-fit">
          <CardHeader className="border-b border-zinc-100 p-3">
            <CardTitle className="text-sm font-medium">Event Details</CardTitle>
            <p className="text-[10px] text-muted-foreground">
              Fill in the information below to create a new event.
            </p>
          </CardHeader>
          <CardContent className="p-4">
            <EventForm />
          </CardContent>
        </Card>
      </div>
    </CMSLayout>
  );
}
