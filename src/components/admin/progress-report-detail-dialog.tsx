"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, Calendar, User, ExternalLink, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/format";
import type { ProgressReportItem } from "./progress-report-dialog";

export function ProgressReportDetailDialog({
  report,
  childSlug,
}: {
  report: ProgressReportItem;
  childSlug?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="h-8 gap-1.5 px-2 text-xs font-medium text-brand-navy hover:text-brand-navy dark:text-blue-400"
      >
        <Eye className="size-3.5" />
        View
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <Badge
              variant="outline"
              className={
                report.published
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
              }
            >
              {report.published ? "Published" : "Draft"}
            </Badge>
            {report.createdAt && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="size-3.5" />
                {formatDate(report.createdAt)}
              </span>
            )}
          </div>
          <DialogTitle className="text-xl font-bold font-heading text-foreground mt-2">
            {report.title}
          </DialogTitle>
          {report.childName && (
            <DialogDescription className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
              <User className="size-3.5 text-brand-navy" />
              Progress report for <strong className="text-foreground">{report.childName}</strong>
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {report.imageUrl && (
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border bg-muted">
              <Image
                src={report.imageUrl}
                alt={report.title}
                fill
                sizes="(max-width: 600px) 100vw, 550px"
                className="object-cover"
              />
            </div>
          )}

          <div className="rounded-xl border bg-muted/20 p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Report Content & Observations
            </h4>
            <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
              {report.body}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            {childSlug ? (
              <Link
                href={`/sponsor-a-child/${childSlug}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 text-xs text-brand-navy dark:text-blue-400 hover:underline font-medium"
              >
                <ExternalLink className="size-3.5" />
                View child on public site
              </Link>
            ) : (
              <div />
            )}

            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
