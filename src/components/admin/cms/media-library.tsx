"use client";

import { useState, useRef, useTransition } from "react";
import Image from "next/image";
import {
  Upload,
  Search,
  Copy,
  Check,
  Trash2,
  Edit,
  Folder,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { uploadCmsMedia, deleteCmsMedia, updateCmsMedia } from "@/actions/admin/cms";

export interface MediaAssetItem {
  id: string;
  url: string;
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  altText: string | null;
  caption: string | null;
  folder: string;
  createdAt: Date;
}

export function MediaLibrary({ initialAssets }: { initialAssets: MediaAssetItem[] }) {
  const [assets, setAssets] = useState<MediaAssetItem[]>(initialAssets);
  const [search, setSearch] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [editingAsset, setEditingAsset] = useState<MediaAssetItem | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [assetToDelete, setAssetToDelete] = useState<MediaAssetItem | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const folders = ["all", ...Array.from(new Set(assets.map((a) => a.folder)))];

  const filteredAssets = assets.filter((a) => {
    const matchesSearch =
      a.filename.toLowerCase().includes(search.toLowerCase()) ||
      (a.altText && a.altText.toLowerCase().includes(search.toLowerCase()));
    const matchesFolder = selectedFolder === "all" || a.folder === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMessage(null);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", selectedFolder === "all" ? "general" : selectedFolder);
    formData.append("altText", file.name.replace(/\.[^/.]+$/, ""));

    startTransition(async () => {
      const res = await uploadCmsMedia(formData);
      if (res.success && res.data) {
        setMessage({ type: "success", text: `Uploaded "${file.name}" successfully!` });
        window.location.reload();
      } else {
        setMessage({ type: "error", text: res.error || "Upload failed" });
      }
    });
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const handleDelete = (asset: MediaAssetItem) => {
    setAssetToDelete(asset);
  };

  const executeDelete = () => {
    if (!assetToDelete) return;
    setMessage(null);
    startTransition(async () => {
      const res = await deleteCmsMedia(assetToDelete.id);
      if (res.success) {
        setMessage({ type: "success", text: `Deleted ${assetToDelete.filename}` });
        setAssets(assets.filter((a) => a.id !== assetToDelete.id));
        setAssetToDelete(null);
      } else {
        setMessage({ type: "error", text: res.error || "Failed to delete asset" });
      }
    });
  };

  const handleSaveMeta = () => {
    if (!editingAsset) return;
    setMessage(null);

    startTransition(async () => {
      const res = await updateCmsMedia(editingAsset.id, {
        altText: editingAsset.altText || undefined,
        caption: editingAsset.caption || undefined,
        folder: editingAsset.folder,
      });

      if (res.success) {
        setMessage({ type: "success", text: "Media metadata updated" });
        setAssets(assets.map((a) => (a.id === editingAsset.id ? editingAsset : a)));
        setEditingAsset(null);
      } else {
        setMessage({ type: "error", text: res.error || "Failed to update media" });
      }
    });
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">Media Library</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Centralized repository for images, banners, and logos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUpload}
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
          />
          <Button
            disabled={isPending}
            onClick={() => fileInputRef.current?.click()}
            className="rounded-xl bg-brand-primary hover:bg-brand-primary-hover shadow-md font-semibold"
          >
            <Upload className="mr-2 size-4" />
            <span>Upload New Media</span>
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

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <div className="flex flex-wrap gap-2">
          {folders.map((f) => (
            <Button
              key={f}
              variant={selectedFolder === f ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFolder(f)}
              className="rounded-xl text-xs capitalize"
            >
              <Folder className="mr-1.5 size-3.5" />
              <span>{f}</span>
            </Button>
          ))}
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search media..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-xl h-9"
          />
        </div>
      </div>

      {/* Assets Grid */}
      {filteredAssets.length === 0 ? (
        <Card className="rounded-2xl border-dashed p-12 text-center text-muted-foreground">
          <ImageIcon className="mx-auto size-12 text-muted-foreground/40 mb-3" />
          <p>No media assets found matching criteria.</p>
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 rounded-xl bg-brand-primary hover:bg-brand-primary-hover"
          >
            Upload Image
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredAssets.map((asset) => (
            <Card
              key={asset.id}
              className="group overflow-hidden rounded-2xl border border-border/70 bg-card hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="relative aspect-square w-full bg-muted overflow-hidden">
                <Image
                  src={asset.url}
                  alt={asset.altText || asset.filename}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <Badge className="absolute top-2 left-2 bg-slate-900/80 text-[10px] text-white">
                  {asset.folder}
                </Badge>
              </div>

              <CardContent className="p-3 space-y-2">
                <p className="text-xs font-semibold truncate text-foreground" title={asset.filename}>
                  {asset.filename}
                </p>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{(asset.sizeBytes / 1024).toFixed(0)} KB</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(asset.url)}
                      className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                      title="Copy URL"
                    >
                      {copiedUrl === asset.url ? (
                        <Check className="size-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingAsset(asset)}
                      className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                      title="Edit Info"
                    >
                      <Edit className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(asset)}
                      className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                      title="Delete"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Alt Text Dialog */}
      {editingAsset && (
        <Dialog open={Boolean(editingAsset)} onOpenChange={() => setEditingAsset(null)}>
          <DialogContent className="sm:max-w-lg rounded-3xl p-6 sm:p-8">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold font-heading">Edit Media Asset</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-muted">
                <Image src={editingAsset.url} alt="" fill className="object-cover" />
              </div>

              <div className="space-y-1.5">
                <Label>Alt Text (Accessibility & SEO)</Label>
                <Input
                  value={editingAsset.altText || ""}
                  onChange={(e) =>
                    setEditingAsset({ ...editingAsset, altText: e.target.value })
                  }
                  placeholder="Describe the image content..."
                />
              </div>

              <div className="space-y-1.5">
                <Label>Folder / Category</Label>
                <Input
                  value={editingAsset.folder}
                  onChange={(e) =>
                    setEditingAsset({ ...editingAsset, folder: e.target.value.toLowerCase().trim() })
                  }
                  placeholder="general, children, heroes..."
                />
              </div>

              <div className="space-y-1.5">
                <Label>Caption (Optional)</Label>
                <Input
                  value={editingAsset.caption || ""}
                  onChange={(e) =>
                    setEditingAsset({ ...editingAsset, caption: e.target.value })
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                disabled={isPending}
                onClick={handleSaveMeta}
                className="rounded-xl bg-brand-primary hover:bg-brand-primary-hover"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Media Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(assetToDelete)}
        onOpenChange={(open) => !open && setAssetToDelete(null)}
        title="Delete Media Asset"
        description={`Are you sure you want to delete ${assetToDelete?.filename}? This will remove the file permanently from the media library and storage.`}
        confirmText="Delete File"
        variant="destructive"
        isPending={isPending}
        onConfirm={executeDelete}
      />
    </div>
  );
}
