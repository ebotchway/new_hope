"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Search,
  CheckCircle2,
  Clock,
  Archive,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { createCmsPage, updatePageMetadata, deleteCmsPage } from "@/actions/admin/cms";

export interface PageListItem {
  id: string;
  slug: string;
  title: string;
  publicTitle: string | null;
  description: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  isSystem: boolean;
  publishedAt: Date | null;
  updatedAt: Date;
  revisionCount: number;
  publishedRevisionNumber: number | null;
  seoTitle: string | null;
  seoDescription: string | null;
}

export function PagesManager({ initialPages }: { initialPages: PageListItem[] }) {
  const [pages, setPages] = useState<PageListItem[]>(initialPages);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingMetadataPage, setEditingMetadataPage] = useState<PageListItem | null>(null);
  const [pageToDelete, setPageToDelete] = useState<PageListItem | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredPages = pages.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    setMessage(null);
    startTransition(async () => {
      const res = await createCmsPage({
        title: newTitle,
        slug: newSlug,
        description: newDesc,
      });

      if (res.success && res.data) {
        setMessage({ type: "success", text: `Page "${newTitle}" created successfully!` });
        setIsCreateOpen(false);
        setNewTitle("");
        setNewSlug("");
        setNewDesc("");
        window.location.reload();
      } else {
        setMessage({ type: "error", text: res.error || "Failed to create page" });
      }
    });
  };

  const handleUpdateMetadata = () => {
    if (!editingMetadataPage) return;
    setMessage(null);

    startTransition(async () => {
      const res = await updatePageMetadata(editingMetadataPage.id, {
        title: editingMetadataPage.title,
        publicTitle: editingMetadataPage.publicTitle || undefined,
        description: editingMetadataPage.description || undefined,
        seoTitle: editingMetadataPage.seoTitle || undefined,
        seoDescription: editingMetadataPage.seoDescription || undefined,
        status: editingMetadataPage.status,
      });

      if (res.success) {
        setMessage({ type: "success", text: "Page metadata updated successfully" });
        setPages(
          pages.map((p) => (p.id === editingMetadataPage.id ? editingMetadataPage : p))
        );
        setEditingMetadataPage(null);
      } else {
        setMessage({ type: "error", text: res.error || "Failed to update metadata" });
      }
    });
  };

  const handleDelete = (page: PageListItem) => {
    if (page.isSystem) return;
    setPageToDelete(page);
  };

  const executeDeletePage = () => {
    if (!pageToDelete) return;
    setMessage(null);
    startTransition(async () => {
      const res = await deleteCmsPage(pageToDelete.id);
      if (res.success) {
        setMessage({ type: "success", text: `Page "/${pageToDelete.slug}" deleted.` });
        setPages(pages.filter((p) => p.id !== pageToDelete.id));
        setPageToDelete(null);
      } else {
        setMessage({ type: "error", text: res.error || "Failed to delete page" });
      }
    });
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">Pages Manager</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage public website pages, create campaigns, and edit layout sections.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="rounded-xl bg-brand-primary hover:bg-brand-primary-hover shadow-md"
        >
          <Plus className="mr-2 size-4" />
          <span>Create New Page</span>
        </Button>
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
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="text-xs font-semibold underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Filter by title or slug..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 rounded-xl"
        />
      </div>

      {/* Pages Table */}
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xs">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground border-b border-border/70">
            <tr>
              <th className="py-3.5 px-5 font-semibold">Page Title & Slug</th>
              <th className="py-3.5 px-4 font-semibold">Status</th>
              <th className="py-3.5 px-4 font-semibold">Revisions</th>
              <th className="py-3.5 px-4 font-semibold">Last Published</th>
              <th className="py-3.5 px-5 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {filteredPages.map((page) => (
              <tr key={page.id} className="hover:bg-muted/20 transition-colors">
                <td className="py-4 px-5">
                  <div className="flex items-center gap-2.5">
                    <div className="font-bold text-foreground font-heading text-base">
                      {page.title}
                    </div>
                    {page.isSystem && (
                      <Badge variant="outline" className="text-xs border-brand-primary/40 text-brand-primary">
                        System Core
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs font-mono text-muted-foreground mt-0.5">
                    /{page.slug === "home" ? "" : page.slug}
                  </div>
                </td>

                <td className="py-4 px-4">
                  {page.status === "PUBLISHED" ? (
                    <Badge className="bg-emerald-600 text-white text-xs">
                      <CheckCircle2 className="mr-1 size-3" />
                      <span>Published</span>
                    </Badge>
                  ) : page.status === "DRAFT" ? (
                    <Badge variant="secondary" className="text-xs">
                      <Clock className="mr-1 size-3" />
                      <span>Draft</span>
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                      <Archive className="mr-1 size-3" />
                      <span>Archived</span>
                    </Badge>
                  )}
                </td>

                <td className="py-4 px-4 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{page.revisionCount}</span> revisions
                  {page.publishedRevisionNumber && (
                    <span className="block text-[11px] text-emerald-600">
                      Live: v{page.publishedRevisionNumber}
                    </span>
                  )}
                </td>

                <td className="py-4 px-4 text-xs text-muted-foreground">
                  {page.publishedAt ? new Date(page.publishedAt).toLocaleDateString() : "Never"}
                </td>

                <td className="py-4 px-5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button asChild size="sm" variant="outline" className="rounded-lg h-8">
                      <Link
                        href={
                          page.slug === "home"
                            ? "/admin/website/homepage"
                            : `/admin/website/pages/${page.id}`
                        }
                      >
                        <Layers className="mr-1.5 size-3.5 text-brand-primary" />
                        <span>Edit Sections</span>
                      </Link>
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-lg h-8"
                      onClick={() => setEditingMetadataPage(page)}
                      title="Edit SEO & Metadata"
                    >
                      <Edit className="size-3.5" />
                    </Button>

                    <Button asChild size="sm" variant="ghost" className="rounded-lg h-8" title="View Public Page">
                      <Link href={page.slug === "home" ? "/" : `/${page.slug}`} target="_blank">
                        <ExternalLink className="size-3.5" />
                      </Link>
                    </Button>

                    {!page.isSystem && (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={isPending}
                        onClick={() => handleDelete(page)}
                        className="rounded-lg h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        title="Delete Page"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create New Page Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-lg rounded-3xl p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-heading">Create New Website Page</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Page Title</Label>
              <Input
                placeholder="e.g. Annual Report 2025"
                value={newTitle}
                onChange={(e) => {
                  setNewTitle(e.target.value);
                  if (!newSlug) {
                    setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""));
                  }
                }}
              />
            </div>

            <div className="space-y-1.5">
              <Label>URL Slug</Label>
              <div className="flex items-center">
                <span className="text-sm text-muted-foreground px-3 py-2 bg-muted rounded-l-md border border-r-0 border-input">
                  /
                </span>
                <Input
                  className="rounded-l-none"
                  placeholder="annual-report-2025"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Lowercase letters, numbers, and hyphens only. Reserved slugs (admin, api, donate) are forbidden.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label>Description (Optional)</Label>
              <Textarea
                placeholder="Internal summary of this page..."
                rows={3}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              disabled={isPending || !newTitle || !newSlug}
              onClick={handleCreate}
              className="rounded-xl bg-brand-primary hover:bg-brand-primary-hover"
            >
              Create Page
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Page Metadata / SEO Dialog */}
      {editingMetadataPage && (
        <Dialog open={Boolean(editingMetadataPage)} onOpenChange={() => setEditingMetadataPage(null)}>
          <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl p-6 sm:p-8">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold font-heading">
                Page Metadata & SEO: {editingMetadataPage.title}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>Internal Title</Label>
                <Input
                  value={editingMetadataPage.title}
                  onChange={(e) =>
                    setEditingMetadataPage({ ...editingMetadataPage, title: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label>Public Header Title</Label>
                <Input
                  value={editingMetadataPage.publicTitle || ""}
                  onChange={(e) =>
                    setEditingMetadataPage({ ...editingMetadataPage, publicTitle: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label>SEO Meta Title</Label>
                <Input
                  placeholder="Title shown in Google Search..."
                  value={editingMetadataPage.seoTitle || ""}
                  onChange={(e) =>
                    setEditingMetadataPage({ ...editingMetadataPage, seoTitle: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label>SEO Meta Description</Label>
                <Textarea
                  placeholder="Summary shown in Google search results (150-160 characters recommended)..."
                  rows={3}
                  value={editingMetadataPage.seoDescription || ""}
                  onChange={(e) =>
                    setEditingMetadataPage({
                      ...editingMetadataPage,
                      seoDescription: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label>Publication Status</Label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={editingMetadataPage.status}
                  onChange={(e) =>
                    setEditingMetadataPage({
                      ...editingMetadataPage,
                      status: e.target.value as "DRAFT" | "PUBLISHED" | "ARCHIVED",
                    })
                  }
                >
                  <option value="DRAFT">DRAFT (Hidden from public)</option>
                  <option value="PUBLISHED">PUBLISHED (Live to public)</option>
                  <option value="ARCHIVED">ARCHIVED (Offline)</option>
                </select>
              </div>
            </div>

            <DialogFooter>
              <Button
                disabled={isPending}
                onClick={handleUpdateMetadata}
                className="rounded-xl bg-brand-primary hover:bg-brand-primary-hover"
              >
                Save Metadata
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Page Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(pageToDelete)}
        onOpenChange={(open) => !open && setPageToDelete(null)}
        title="Delete Website Page"
        description={`Are you sure you want to permanently delete page "/${pageToDelete?.slug}"? All associated page revisions and sections will be removed.`}
        confirmText="Delete Page"
        variant="destructive"
        isPending={isPending}
        onConfirm={executeDeletePage}
      />
    </div>
  );
}
