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
            className="rounded-none bg-white hover:bg-zinc-50 border-zinc-200 h-8 text-xs sm:text-sm cursor-pointer px-3"
          >
            <ArrowLeftIcon className="mr-1.5 h-3.5 w-3.5" />
            Back to Events
          </Button>
        </Link>
      }
    >
      <div className="bg-zinc-50 p-3 sm:p-4">
        <Card className="max-w-3xl rounded-none border-zinc-200 bg-white shadow-sm h-fit">
          <CardHeader className="border-b border-zinc-100 p-4">
            <CardTitle className="text-base font-medium">
              Event Details
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Fill in the information below to create a new event.
            </p>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <EventForm />
          </CardContent>
        </Card>
      </div>
    </CMSLayout>
  );
}
