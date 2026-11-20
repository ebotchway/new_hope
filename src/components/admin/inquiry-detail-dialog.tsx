"use client";

import { useState } from "react";
import {
  Eye,
  Mail,
  Phone,
  Building,
  Calendar,
  Briefcase,
  CheckCircle,
  Clock,
  Sparkles,
} from "lucide-react";
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
import { InquiryStatusSelect } from "@/components/admin/inquiry-status-select";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteInquiry } from "@/actions/admin/inquiries";
import { formatDate } from "@/lib/format";
import type { InquiryStatus } from "@/generated/prisma/enums";

export interface InquiryDetailData {
  id: string;
  category?: string | null;
  type: string;
  name: string;
  email: string;
  phone?: string | null;
  organization?: string | null;
  role?: string | null;
  subject?: string | null;
  message?: string | null;
  preferredFrequency?: string | null;
  skills?: string | null;
  availability?: string | null;
  status: InquiryStatus;
  createdAt: Date | string;
}

export function InquiryDetailDialog({ inquiry }: { inquiry: InquiryDetailData }) {
  const [open, setOpen] = useState(false);
  const isBrightener = inquiry.category === "BRIGHTENER_REGISTRATION";

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
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8">
        <DialogHeader>
          <div className="flex flex-wrap items-center justify-between gap-2 pr-4">
            <Badge
              variant={isBrightener ? "default" : "secondary"}
              className={isBrightener ? "bg-brand-navy text-white text-xs" : "text-xs"}
            >
              {isBrightener ? "Brightener Registration" : "General Inquiry"}
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">
              {formatDate(inquiry.createdAt)}
            </span>
          </div>
          <DialogTitle className="text-2xl font-bold font-heading text-foreground mt-2 break-words">
            {inquiry.subject || `${inquiry.type.replace(/_/g, " ")} from ${inquiry.name}`}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Inquiry Category: {inquiry.type.replace(/_/g, " ")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2 text-sm">
          {/* Sender Information */}
          <div className="rounded-2xl border bg-muted/30 p-5 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Sender Contact Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div>
                <span className="text-muted-foreground block text-xs">Full Name:</span>
                <span className="font-semibold text-foreground break-words">{inquiry.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Email Address:</span>
                <a href={`mailto:${inquiry.email}`} className="font-medium text-brand-navy dark:text-blue-400 hover:underline flex items-center gap-1 break-all">
                  <Mail className="size-3 shrink-0" />
                  {inquiry.email}
                </a>
              </div>
              {inquiry.phone && (
                <div>
                  <span className="text-muted-foreground block text-xs">Phone Number:</span>
                  <a href={`tel:${inquiry.phone}`} className="text-foreground flex items-center gap-1 hover:underline break-all">
                    <Phone className="size-3 text-muted-foreground shrink-0" />
                    {inquiry.phone}
                  </a>
                </div>
              )}
              {inquiry.organization && (
                <div>
                  <span className="text-muted-foreground block text-xs">Organization:</span>
                  <span className="text-foreground flex items-center gap-1 break-words">
                    <Building className="size-3 text-muted-foreground shrink-0" />
                    {inquiry.organization} {inquiry.role ? `(${inquiry.role})` : ""}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Registration Details (if Brightener) */}
          {(inquiry.skills || inquiry.availability || inquiry.preferredFrequency) && (
            <div className="rounded-xl border bg-amber-50/50 dark:bg-amber-950/20 p-4 space-y-2 border-amber-200/60 dark:border-amber-900/40 text-xs sm:text-sm">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-amber-600" />
                Partnership Profile
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {inquiry.skills && (
                  <div>
                    <span className="text-muted-foreground block">Key Skills / Focus:</span>
                    <span className="font-medium text-foreground">{inquiry.skills}</span>
                  </div>
                )}
                {inquiry.availability && (
                  <div>
                    <span className="text-muted-foreground block">Availability:</span>
                    <span className="font-medium text-foreground">{inquiry.availability}</span>
                  </div>
                )}
                {inquiry.preferredFrequency && (
                  <div>
                    <span className="text-muted-foreground block">Giving Frequency:</span>
                    <span className="font-medium text-foreground">{inquiry.preferredFrequency}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submission Message */}
          <div className="rounded-xl border bg-card p-4 space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Submitted Message / Notes
            </h4>
            <div className="text-xs sm:text-sm text-foreground whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
              {inquiry.message || "No message body provided with this submission."}
            </div>
          </div>

          {/* Operational Footer Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Status:</span>
              <InquiryStatusSelect id={inquiry.id} status={inquiry.status} />
            </div>

            <div className="flex items-center gap-2">
              <Button asChild size="sm" className="bg-brand-navy hover:bg-brand-navy/90 text-white gap-1.5 text-xs">
                <a href={`mailto:${inquiry.email}?subject=Re:%20LivingHope%20Inquiry%20-%20${encodeURIComponent(inquiry.subject || inquiry.type)}`}>
                  <Mail className="size-3.5" />
                  Reply via Email
                </a>
              </Button>

              <DeleteButton
                confirmMessage="Permanently delete this inquiry from the database?"
                action={async () => {
                  return deleteInquiry(inquiry.id);
                }}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
