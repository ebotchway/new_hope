"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import Image from "next/image";
import { Upload, Search, Image as ImageIcon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { getCmsMediaAssetsList, uploadCmsMedia } from "@/actions/admin/cms";

export interface MediaAssetSummary {
  id: string;
  url: string;
  filename: string;
  altText: string | null;
  caption: string | null;
  folder: string;
  sizeBytes: number;
}

interface MediaPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string, altText?: string) => void;
  currentValue?: string;
  folderFilter?: string;
}

export function MediaPickerDialog({
  open,
  onOpenChange,
  onSelect,
  currentValue,
  folderFilter,
}: MediaPickerDialogProps) {
  const [assets, setAssets] = useState<MediaAssetSummary[]>([]);
  const [search, setSearch] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string>(folderFilter || "all");
  const [isUploading, startUpload] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      getCmsMediaAssetsList().then((data) => setAssets(data));
    }
  }, [open]);

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

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", selectedFolder === "all" ? "general" : selectedFolder);
    formData.append("altText", file.name.replace(/\.[^/.]+$/, ""));

    startUpload(async () => {
      const res = await uploadCmsMedia(formData);
      if (res.success && res.data) {
        const fresh = await getCmsMediaAssetsList();
        setAssets(fresh);
        onSelect(res.data.url, file.name);
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold font-heading flex items-center gap-2">
            <ImageIcon className="size-5 text-brand-primary" />
            <span>Select Media from Library</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Top Controls Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="flex flex-wrap gap-1.5">
              {folders.map((f) => (
                <Button
                  key={f}
                  type="button"
                  variant={selectedFolder === f ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFolder(f)}
                  className="rounded-xl text-xs capitalize h-8"
                >
                  {f}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search photos..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-8 rounded-xl text-xs w-48"
                />
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleUpload}
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
              />
              <Button
                type="button"
                size="sm"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl bg-brand-primary hover:bg-brand-primary-hover h-8 text-xs shrink-0"
              >
                <Upload className="mr-1 size-3.5" />
                <span>Upload</span>
              </Button>
            </div>
          </div>

          {/* Media Grid */}
          {filteredAssets.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
              <ImageIcon className="mx-auto size-10 text-muted-foreground/40 mb-2" />
              <p className="text-sm">No media found.</p>
              <Button
                type="button"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 rounded-xl bg-brand-primary hover:bg-brand-primary-hover"
              >
                Upload an image now
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto p-1">
              {filteredAssets.map((asset) => {
                const isSelected = currentValue === asset.url;

                return (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => {
                      onSelect(asset.url, asset.altText || undefined);
                      onOpenChange(false);
                    }}
                    className={`group relative aspect-4/3 rounded-xl overflow-hidden border text-left transition-all hover:ring-2 hover:ring-brand-primary ${
                      isSelected
                        ? "ring-2 ring-brand-primary border-brand-primary"
                        : "border-border/70"
                    }`}
                  >
                    <Image
                      src={asset.url}
                      alt={asset.altText || asset.filename}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2 text-white">
                      <span className="text-[11px] truncate font-medium">{asset.filename}</span>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 size-6 rounded-full bg-brand-primary text-white flex items-center justify-center shadow-md">
                        <Check className="size-3.5" />
                      </div>
                    )}
                    <Badge className="absolute top-2 left-2 bg-slate-900/80 text-[9px] text-white">
                      {asset.folder}
                    </Badge>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
