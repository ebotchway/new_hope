"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import {
  ArrowUp,
  ArrowDown,
  Trash2,
  Edit,
  Plus,
  Eye,
  CheckCircle2,
  History,
  RotateCcw,
  Layers,
  Save,
  ArrowLeft,
  GitCompare,
  Calendar,
  AlertCircle,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { CmsSection, CmsSectionType } from "@/lib/cms-types";
import {
  savePageDraft,
  publishPageRevision,
  restorePageRevision,
  unpublishPage,
  schedulePagePublish,
} from "@/actions/admin/cms";
import { SectionPropertyEditor } from "./section-property-editor";
import { RevisionDiffDialog } from "./revision-diff-dialog";

export interface PageSectionsEditorProps {
  pageId: string;
  pageTitle: string;
  slug: string;
  initialSections: CmsSection[];
  publishedRevisionId?: string | null;
  revisions: Array<{
    id: string;
    revisionNumber: number;
    authorName: string | null;
    changelog: string | null;
    createdAt: Date;
  }>;
}

function generateSectionId(type: string): string {
  return `sec_${type}_${Math.random().toString(36).substring(2, 9)}`;
}

function asProps(props: unknown): Record<string, unknown> {
  return (props && typeof props === "object" ? props : {}) as Record<string, unknown>;
}

const SECTION_TYPE_INFO: Record<
  CmsSectionType,
  { label: string; description: string; defaultProps: Record<string, unknown> }
> = {
  hero: {
    label: "Hero Banner",
    description: "Top visual banner with headline, background image, and CTAs",
    defaultProps: {
      title: "Page Title",
      subtitle: "Welcome to this page.",
      alignment: "center",
    },
  },
  rich_text: {
    label: "Rich Narrative",
    description: "Structured multi-paragraph narrative text",
    defaultProps: {
      heading: "Overview",
      content: "Write detailed narrative copy here...",
      containerWidth: "default",
      backgroundColor: "white",
    },
  },
  image_text: {
    label: "Image & Text Split",
    description: "Side-by-side photograph with descriptive story and bullet points",
    defaultProps: {
      heading: "Section Heading",
      lead: "Highlight sentence.",
      paragraphs: ["Paragraph narrative."],
      imageUrl: "/images/placeholders/street-child.webp",
      imageAlt: "Photo",
      imagePosition: "right",
      bulletPoints: ["Key takeaway 1", "Key takeaway 2"],
    },
  },
  card_grid: {
    label: "Card Grid",
    description: "Responsive 2, 3, or 4 column grid of cards",
    defaultProps: {
      heading: "Key Highlights",
      columns: 3,
      cards: [
        { title: "Point 1", description: "Description.", icon: "Sparkles" },
        { title: "Point 2", description: "Description.", icon: "ShieldCheck" },
        { title: "Point 3", description: "Description.", icon: "Heart" },
      ],
    },
  },
  impact_stats: {
    label: "Impact Counters",
    description: "Audited numbers and metrics",
    defaultProps: {
      heading: "Key Results",
      useLiveDatabase: true,
      customStats: [{ value: "100%", label: "Direct Impact" }],
    },
  },
  featured_children: {
    label: "Featured Children",
    description: "Showcase children needing support",
    defaultProps: {
      heading: "Children Awaiting Help",
      mode: "auto_urgent",
      maxCount: 3,
    },
  },
  programmes: {
    label: "Programmes Grid",
    description: "Showcase core intervention pillars",
    defaultProps: {
      heading: "Our Programmes",
      programmes: [{ title: "Programme 1", category: "Core", description: "Details." }],
    },
  },
  featured_stories: {
    label: "Impact Stories Carousel",
    description: "Testimonials and recent donor ticker",
    defaultProps: {
      heading: "Stories of Impact",
      showRecentDonors: true,
    },
  },
  testimonials: {
    label: "Supporter Voices",
    description: "Quotes from donors and partners",
    defaultProps: {
      heading: "Testimonials",
      testimonials: [{ quote: "Wonderful impact.", author: "Donor Name", role: "Supporter" }],
    },
  },
  faq: {
    label: "Accordion FAQs",
    description: "Collapsible Q&A list",
    defaultProps: {
      heading: "Common Questions",
      items: [{ question: "Question?", answer: "Answer." }],
    },
  },
  donation_cta: {
    label: "Donation Banner",
    description: "Call to action banner with preset dollar amounts",
    defaultProps: {
      heading: "Support Our Mission",
      presetAmounts: [25, 50, 100, 250],
      primaryCtaLabel: "Donate Now",
    },
  },
  partnership_cta: {
    label: "Partnership Banner",
    description: "Callout for partners and brighteners",
    defaultProps: {
      heading: "Partner With Us",
      buttonLabel: "Get in Touch",
      buttonUrl: "/become-a-brightener",
    },
  },
  contact_info: {
    label: "Contact & Location",
    description: "Offices, phones, and Google Map embed",
    defaultProps: {
      heading: "Contact LivingHope",
      address: "Accra, Ghana",
      phone: "+233 24 000 0000",
      email: "info@livinghope.org",
    },
  },
};

export function PageSectionsEditor({
  pageId,
  pageTitle,
  slug,
  initialSections,
  publishedRevisionId,
  revisions,
}: PageSectionsEditorProps) {
  const [sections, setSections] = useState<CmsSection[]>(initialSections);
  const [savedSections, setSavedSections] = useState<string>(JSON.stringify(initialSections));
  const [activeDraftRevId, setActiveDraftRevId] = useState<string | null>(publishedRevisionId || null);
  const [editingSection, setEditingSection] = useState<CmsSection | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isPublishConfirmOpen, setIsPublishConfirmOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [scheduledDateTime, setScheduledDateTime] = useState("");
  const [compareRevId, setCompareRevId] = useState<string | null>(null);
  const [compareRevNum, setCompareRevNum] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const isDirty = JSON.stringify(sections) !== savedSections;

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const moveUp = (index: number) => {
    if (index === 0) return;
    const next = [...sections];
    const temp = next[index - 1];
    next[index - 1] = next[index];
    next[index] = temp;
    setSections(next);
  };

  const moveDown = (index: number) => {
    if (index === sections.length - 1) return;
    const next = [...sections];
    const temp = next[index + 1];
    next[index + 1] = next[index];
    next[index] = temp;
    setSections(next);
  };

  const toggleEnabled = (index: number) => {
    const next = [...sections];
    next[index].enabled = !next[index].enabled;
    setSections(next);
  };

  const removeSection = (index: number) => {
    const next = sections.filter((_, i) => i !== index);
    setSections(next);
  };

  const addSection = (type: CmsSectionType) => {
    const info = SECTION_TYPE_INFO[type];
    const newSection: CmsSection = {
      id: generateSectionId(type),
      type,
      enabled: true,
      props: JSON.parse(JSON.stringify(info.defaultProps)),
    };
    setSections([...sections, newSection]);
    setIsAddOpen(false);
  };

  const handleSaveDraft = () => {
    setMessage(null);
    startTransition(async () => {
      const res = await savePageDraft(pageId, sections, `Draft update for ${pageTitle}`);
      if (res.success && res.data) {
        setActiveDraftRevId(res.data.revisionId);
        setSavedSections(JSON.stringify(sections));
        setMessage({ type: "success", text: `Draft saved as Revision #${res.data.revisionNumber}` });
      } else {
        setMessage({ type: "error", text: res.error || "Failed to save draft" });
      }
    });
  };

  const handlePublish = () => {
    setMessage(null);
    setIsPublishConfirmOpen(false);
    startTransition(async () => {
      const draftRes = await savePageDraft(pageId, sections, `Pre-publish sync for ${pageTitle}`);
      const revId = draftRes.data?.revisionId || activeDraftRevId;

      if (!revId) {
        setMessage({ type: "error", text: "No revision available to publish" });
        return;
      }

      const pubRes = await publishPageRevision(pageId, revId);
      if (pubRes.success) {
        setActiveDraftRevId(revId);
        setSavedSections(JSON.stringify(sections));
        setMessage({ type: "success", text: `Page "${pageTitle}" published live!` });
      } else {
        setMessage({ type: "error", text: pubRes.error || "Failed to publish page" });
      }
    });
  };

  const handleSchedulePublish = () => {
    if (!scheduledDateTime) return;
    const targetDate = new Date(scheduledDateTime);
    if (targetDate.getTime() <= Date.now()) {
      setMessage({ type: "error", text: "Scheduled publication time must be in the future" });
      return;
    }

    setMessage(null);
    setIsScheduleOpen(false);
    startTransition(async () => {
      const draftRes = await savePageDraft(pageId, sections, `Scheduled release for ${pageTitle}`);
      const revId = draftRes.data?.revisionId || activeDraftRevId;
      if (!revId) return;

      const schedRes = await schedulePagePublish(pageId, revId, targetDate);
      if (schedRes.success) {
        setMessage({
          type: "success",
          text: `Page scheduled to publish live at ${targetDate.toLocaleString()}`,
        });
      } else {
        setMessage({ type: "error", text: schedRes.error || "Failed to schedule publication" });
      }
    });
  };

  const handleUnpublish = () => {
    if (!confirm(`Are you sure you want to take "${pageTitle}" offline? Public visitors will receive a 404 until republished.`)) {
      return;
    }

    setMessage(null);
    startTransition(async () => {
      const res = await unpublishPage(pageId);
      if (res.success) {
        setMessage({ type: "success", text: `Page "${pageTitle}" unpublished. It is now in DRAFT status.` });
      } else {
        setMessage({ type: "error", text: res.error || "Failed to unpublish" });
      }
    });
  };

  const handleRestore = (revId: string, revNum: number) => {
    setMessage(null);
    startTransition(async () => {
      const res = await restorePageRevision(pageId, revId);
      if (res.success) {
        setMessage({ type: "success", text: `Restored Revision #${revNum}` });
        window.location.reload();
      } else {
        setMessage({ type: "error", text: res.error || "Failed to restore revision" });
      }
    });
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Revision Diff Comparison Modal */}
      <RevisionDiffDialog
        open={Boolean(compareRevId)}
        onOpenChange={(open) => !open && setCompareRevId(null)}
        pageId={pageId}
        currentSections={sections}
        targetRevisionId={compareRevId}
        targetRevisionNumber={compareRevNum}
        onRestore={handleRestore}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="h-8 rounded-lg">
              <Link href="/admin/website/pages">
                <ArrowLeft className="mr-1 size-4" />
                <span>Pages</span>
              </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight font-heading">
              Edit: {pageTitle}
            </h1>
            <Badge variant="outline" className="font-mono text-xs">
              /{slug}
            </Badge>
            {isDirty && (
              <Badge variant="outline" className="border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-1 text-xs">
                <AlertCircle className="size-3" />
                <span>Unsaved Changes</span>
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Arrange and configure layout sections for this page.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="outline" className="rounded-xl" onClick={() => setIsHistoryOpen(true)}>
            <History className="mr-1.5 size-4" />
            <span>History ({revisions.length})</span>
          </Button>

          <Button asChild variant="outline" className="rounded-xl">
            <Link
              href={activeDraftRevId ? `/preview?slug=${slug}&revision=${activeDraftRevId}` : `/preview?slug=${slug}`}
              target="_blank"
            >
              <Eye className="mr-1.5 size-4 text-brand-primary" />
              <span>Preview</span>
            </Link>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsScheduleOpen(true)}
            className="rounded-xl"
            title="Schedule for future release"
          >
            <Calendar className="mr-1.5 size-4 text-muted-foreground" />
            <span>Schedule</span>
          </Button>

          <Button variant="outline" disabled={isPending} onClick={handleSaveDraft} className="rounded-xl">
            <Save className="mr-1.5 size-4" />
            <span>Save Draft</span>
          </Button>

          <Button
            disabled={isPending}
            onClick={() => setIsPublishConfirmOpen(true)}
            className="rounded-xl bg-brand-primary hover:bg-brand-primary-hover shadow-md font-semibold"
          >
            <CheckCircle2 className="mr-1.5 size-4" />
            <span>Publish Live</span>
          </Button>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-center justify-between ${
            message.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
              : "bg-destructive/10 border-destructive/30 text-destructive"
          }`}
        >
          <span>{message.text}</span>
          <button type="button" onClick={() => setMessage(null)} className="text-xs font-semibold underline ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* Sections List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-heading flex items-center gap-2">
            <Layers className="size-5 text-brand-primary" />
            <span>Section Stack ({sections.length})</span>
          </h2>
          <Button onClick={() => setIsAddOpen(true)} className="rounded-xl bg-brand-primary hover:bg-brand-primary-hover shadow-xs text-sm">
            <Plus className="mr-1.5 size-4" />
            <span>Add Section</span>
          </Button>
        </div>

        {sections.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <p className="text-muted-foreground">No sections configured on this page.</p>
            <Button onClick={() => setIsAddOpen(true)} className="mt-4 rounded-xl">
              Add Your First Section
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {sections.map((section, idx) => {
              const info = SECTION_TYPE_INFO[section.type] || { label: section.type, description: "Section" };
              const propsObj = asProps(section.props);
              const title =
                (typeof propsObj?.heading === "string" && propsObj.heading) ||
                (typeof propsObj?.title === "string" && propsObj.title) ||
                info.label;

              return (
                <Card
                  key={section.id}
                  className={`rounded-2xl border transition-all ${
                    section.enabled ? "border-border/80 bg-card shadow-xs" : "border-border/40 bg-muted/40 opacity-60"
                  }`}
                >
                  <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={idx === 0}
                          onClick={() => moveUp(idx)}
                          className="size-7 rounded-md hover:bg-muted"
                          title="Move Up"
                        >
                          <ArrowUp className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={idx === sections.length - 1}
                          onClick={() => moveDown(idx)}
                          className="size-7 rounded-md hover:bg-muted"
                          title="Move Down"
                        >
                          <ArrowDown className="size-3.5" />
                        </Button>
                      </div>

                      <div className="size-8 rounded-lg bg-brand-primary/10 text-brand-primary font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-base text-foreground font-heading">{title}</span>
                          <Badge variant="outline" className="text-xs">{info.label}</Badge>
                          {!section.enabled && <Badge variant="secondary" className="text-xs">Hidden</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{info.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="flex items-center gap-2 mr-2">
                        <span className="text-xs text-muted-foreground">Visible</span>
                        <Switch checked={section.enabled} onCheckedChange={() => toggleEnabled(idx)} />
                      </div>

                      <Button variant="outline" size="sm" className="rounded-lg" onClick={() => setEditingSection(section)}>
                        <Edit className="mr-1.5 size-3.5 text-brand-primary" />
                        <span>Edit Content</span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSection(idx)}
                        className="size-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        title="Delete Section"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Section Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold font-heading">Add Section to Page</DialogTitle>
          </DialogHeader>

          <div className="grid gap-3 sm:grid-cols-2 pt-2">
            {(Object.keys(SECTION_TYPE_INFO) as CmsSectionType[]).map((type) => {
              const info = SECTION_TYPE_INFO[type];
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => addSection(type)}
                  className="p-4 rounded-2xl border border-border/70 hover:border-brand-primary hover:bg-brand-primary/5 text-left transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="font-bold text-foreground text-sm font-heading group-hover:text-brand-primary">
                      {info.label}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{info.description}</p>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-brand-primary">
                    <Plus className="size-3.5" />
                    <span>Insert Section</span>
                  </div>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Section Content Property Editor Dialog */}
      {editingSection && (
        <Dialog open={Boolean(editingSection)} onOpenChange={() => setEditingSection(null)}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold font-heading flex items-center gap-2">
                <Edit className="size-5 text-brand-primary" />
                <span>
                  Configure: {SECTION_TYPE_INFO[editingSection.type]?.label || editingSection.type}
                </span>
              </DialogTitle>
            </DialogHeader>

            <SectionPropertyEditor
              section={editingSection}
              onChange={(updated) => setEditingSection(updated)}
            />

            <DialogFooter>
              <Button
                onClick={() => {
                  setSections(sections.map((s) => (s.id === editingSection.id ? editingSection : s)));
                  setEditingSection(null);
                }}
                className="rounded-xl bg-brand-primary hover:bg-brand-primary-hover shadow-sm"
              >
                Apply Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Publish Live Confirmation Dialog */}
      <Dialog open={isPublishConfirmOpen} onOpenChange={setIsPublishConfirmOpen}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-heading flex items-center gap-2 text-foreground">
              <CheckCircle2 className="size-5 text-emerald-600" />
              <span>Publish Changes Live</span>
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm text-muted-foreground leading-relaxed">
            This will immediately publish the current {sections.length} layout sections to all public visitors of &ldquo;{pageTitle}&rdquo;. A new versioned revision will be permanently saved.
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsPublishConfirmOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              disabled={isPending}
              onClick={handlePublish}
              className="rounded-xl bg-brand-primary hover:bg-brand-primary-hover shadow-md font-semibold"
            >
              Confirm &amp; Publish Live
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Release Dialog */}
      <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-heading flex items-center gap-2">
              <Calendar className="size-5 text-brand-primary" />
              <span>Schedule Future Publication</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 text-sm">
            <p className="text-muted-foreground">
              Select the exact date and time when this revision should go live to public visitors.
            </p>
            <div className="space-y-1.5">
              <Label>Release Date &amp; Time</Label>
              <Input
                type="datetime-local"
                value={scheduledDateTime}
                onChange={(e) => setScheduledDateTime(e.target.value)}
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              disabled={isPending || !scheduledDateTime}
              onClick={handleSchedulePublish}
              className="rounded-xl bg-brand-primary hover:bg-brand-primary-hover"
            >
              Confirm Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revision History Drawer */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <div className="flex items-center justify-between pr-6">
              <DialogTitle className="text-2xl font-bold font-heading">
                Revision History: {pageTitle}
              </DialogTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleUnpublish}
                className="rounded-xl text-xs text-amber-700 border-amber-300 hover:bg-amber-50 dark:text-amber-400"
              >
                <EyeOff className="mr-1.5 size-3.5" />
                <span>Unpublish Page</span>
              </Button>
            </div>
          </DialogHeader>

          <div className="divide-y divide-border/60 pt-2">
            {revisions.map((rev) => {
              const isCurrent = rev.id === publishedRevisionId;

              return (
                <div key={rev.id} className="py-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">Revision #{rev.revisionNumber}</span>
                      {isCurrent && <Badge className="bg-emerald-600 text-white text-xs">Currently Published</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {rev.changelog || "No changelog recorded"} · by {rev.authorName || "Staff"} ·{" "}
                      {new Date(rev.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl text-xs h-8"
                      onClick={() => {
                        setCompareRevId(rev.id);
                        setCompareRevNum(rev.revisionNumber);
                      }}
                    >
                      <GitCompare className="mr-1 size-3 text-brand-primary" />
                      <span>Compare</span>
                    </Button>

                    {!isCurrent && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl text-xs h-8"
                        disabled={isPending}
                        onClick={() => handleRestore(rev.id, rev.revisionNumber)}
                      >
                        <RotateCcw className="mr-1.5 size-3.5 text-brand-primary" />
                        <span>Restore</span>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
