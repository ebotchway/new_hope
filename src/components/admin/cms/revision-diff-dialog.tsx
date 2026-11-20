"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { GitCompare, History } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CmsSection } from "@/lib/cms-types";
import { compareRevisions } from "@/actions/admin/cms";

interface RevisionDiffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageId?: string;
  currentSections: CmsSection[];
  targetRevisionId?: string | null;
  targetRevisionNumber?: number | null;
  onRestore?: (revisionId: string, revisionNumber: number) => void;
}

export function RevisionDiffDialog({
  open,
  onOpenChange,
  currentSections,
  targetRevisionId,
  targetRevisionNumber,
  onRestore,
}: RevisionDiffDialogProps) {
  const [targetSections, setTargetSections] = useState<CmsSection[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmRestoreOpen, setConfirmRestoreOpen] = useState(false);

  useEffect(() => {
    if (!open || !targetRevisionId) return;
    let cancelled = false;

    queueMicrotask(() => {
      if (!cancelled) setLoading(true);
    });

    compareRevisions(targetRevisionId, targetRevisionId).then((res) => {
      if (!cancelled) {
        setLoading(false);
        if (res.success && res.data) {
          setTargetSections(res.data.revA.sections || []);
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, [open, targetRevisionId]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-y-auto rounded-3xl p-6 sm:p-8">
          <DialogHeader>
            <div className="flex flex-wrap items-center justify-between gap-3 pr-6">
              <DialogTitle className="text-2xl font-bold font-heading flex items-center gap-2">
                <GitCompare className="size-5 text-brand-primary shrink-0" />
                <span>Compare: Current Draft vs Revision #{targetRevisionNumber}</span>
              </DialogTitle>
              {targetRevisionId && targetRevisionNumber && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-xl text-amber-700 border-amber-300 hover:bg-amber-50"
                  onClick={() => setConfirmRestoreOpen(true)}
                >
                  <History className="size-4" />
                  Restore Revision #{targetRevisionNumber}
                </Button>
              )}
            </div>
            <DialogDescription>
              Side-by-side comparison between your current working draft and the selected historical revision.
            </DialogDescription>
          </DialogHeader>

        {loading ? (
          <div className="py-12 text-center text-muted-foreground text-sm">
            Loading revision data for comparison…
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 pt-4">
            {/* Left: Current Draft */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b">
                <span className="font-bold text-sm text-foreground">Current Working Draft</span>
                <Badge variant="outline">{currentSections.length} Sections</Badge>
              </div>

              <div className="space-y-2">
                {currentSections.map((s, idx) => {
                  const props = (s.props || {}) as Record<string, any>;
                  const title = String(props.heading || props.title || s.type);
                  const subtitle = String(props.subtitle || props.subheading || props.content || "Configured");

                  return (
                    <div
                      key={s.id}
                      className="p-3 rounded-xl border border-border/80 bg-card text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground">
                          #{idx + 1} {title}
                        </span>
                        <Badge variant="secondary" className="text-[10px] uppercase">
                          {s.type}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-[11px] truncate">{subtitle}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Selected Target Revision */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b">
                <span className="font-bold text-sm text-foreground">
                  Revision #{targetRevisionNumber} (Target)
                </span>
                <Badge variant="outline">{targetSections.length} Sections</Badge>
              </div>

              <div className="space-y-2">
                {targetSections.map((s, idx) => {
                  const props = (s.props || {}) as Record<string, any>;
                  const title = String(props.heading || props.title || s.type);
                  const subtitle = String(props.subtitle || props.subheading || props.content || "Configured");

                  return (
                    <div
                      key={s.id}
                      className="p-3 rounded-xl border border-border/80 bg-muted/30 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground">
                          #{idx + 1} {title}
                        </span>
                        <Badge variant="secondary" className="text-[10px] uppercase">
                          {s.type}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-[11px] truncate">{subtitle}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>

    <ConfirmDialog
      open={confirmRestoreOpen}
      onOpenChange={setConfirmRestoreOpen}
      title={`Restore Revision #${targetRevisionNumber}`}
      description={`Are you sure you want to restore Revision #${targetRevisionNumber}? This will replace your current working draft with the layout and sections from this historical revision.`}
      confirmText="Restore Revision"
      cancelText="Cancel"
      variant="warning"
      onConfirm={() => {
        if (targetRevisionId && targetRevisionNumber) {
          onRestore?.(targetRevisionId, targetRevisionNumber);
          setConfirmRestoreOpen(false);
          onOpenChange(false);
        }
      }}
    />
  </>
  );
}
