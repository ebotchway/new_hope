"use client";

import { useState, useEffect } from "react";
import { GitCompare, ArrowRight, RotateCcw, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CmsSection } from "@/lib/cms-types";
import { compareRevisions } from "@/actions/admin/cms";

interface RevisionDiffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageId: string;
  currentSections: CmsSection[];
  targetRevisionId: string | null;
  targetRevisionNumber: number | null;
  onRestore: (revisionId: string, revisionNumber: number) => void;
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

  useEffect(() => {
    if (open && targetRevisionId) {
      setLoading(true);
      // Fetch target revision sections
      compareRevisions(targetRevisionId, targetRevisionId).then((res) => {
        setLoading(false);
        if (res.success && res.data) {
          setTargetSections(res.data.revA.sections || []);
        }
      });
    }
  }, [open, targetRevisionId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <DialogTitle className="text-2xl font-bold font-heading flex items-center gap-2">
              <GitCompare className="size-5 text-brand-primary" />
              <span>Compare: Current Draft vs Revision #{targetRevisionNumber}</span>
            </DialogTitle>
            {targetRevisionId && targetRevisionNumber && (
              <Button
                size="sm"
                onClick={() => {
                  onRestore(targetRevisionId, targetRevisionNumber);
                  onOpenChange(false);
                }}
                className="rounded-xl bg-brand-primary hover:bg-brand-primary-hover shadow-sm"
              >
                <RotateCcw className="mr-1.5 size-3.5" />
                <span>Restore Revision #{targetRevisionNumber}</span>
              </Button>
            )}
          </div>
        </DialogHeader>

        {loading ? (
          <div className="p-12 text-center text-muted-foreground">Loading revision details...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Left: Current Draft */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b">
                <span className="font-bold text-sm text-foreground">Current Working Draft</span>
                <Badge variant="outline">{currentSections.length} Sections</Badge>
              </div>

              <div className="space-y-2">
                {currentSections.map((s, idx) => {
                  const props = (s.props || {}) as Record<string, any>;
                  const title = props.heading || props.title || s.type;

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
                      <p className="text-muted-foreground text-[11px] truncate">
                        {props.subtitle || props.subheading || props.content || "Configured"}
                      </p>
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
                  const title = props.heading || props.title || s.type;

                  return (
                    <div
                      key={s.id}
                      className="p-3 rounded-xl border border-border/80 bg-muted/30 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground">
                          #{idx + 1} {title}
                        </span>
                        <Badge variant="outline" className="text-[10px] uppercase">
                          {s.type}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-[11px] truncate">
                        {props.subtitle || props.subheading || props.content || "Configured"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
