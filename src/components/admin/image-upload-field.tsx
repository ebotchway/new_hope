"use client";

import { useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export function ImageUploadField({
  name,
  label = "Photo",
  existingUrl,
  aspect = 1,
  round = false,
}: {
  name: string;
  label?: string;
  existingUrl?: string | null;
  aspect?: number;
  round?: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLInputElement>(null);

  const [rawImage, setRawImage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingUrl ?? null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setRawImage(reader.result as string);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setDialogOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  async function handleConfirmCrop() {
    if (!rawImage || !croppedAreaPixels || !fileInputRef.current) return;
    const { getCroppedImageFile } = await import("@/lib/crop-image");
    const croppedFile = await getCroppedImageFile(rawImage, croppedAreaPixels, `${name}.jpg`);

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(croppedFile);
    fileInputRef.current.files = dataTransfer.files;

    setPreviewUrl(URL.createObjectURL(croppedFile));
    setDialogOpen(false);
    setRawImage(null);
  }

  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-4">
        <div
          className={`relative size-20 shrink-0 overflow-hidden bg-muted ${round ? "rounded-full" : "rounded-lg"}`}
        >
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <ImagePlus className="size-6" />
            </div>
          )}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => pickerRef.current?.click()}>
          {previewUrl ? "Change photo" : "Upload photo"}
        </Button>
      </div>

      {/* Hidden input actually submitted with the form */}
      <input ref={fileInputRef} type="file" name={name} className="hidden" accept="image/*" />
      {/* Visible-only-to-JS picker used to source the raw file for cropping */}
      <input ref={pickerRef} type="file" accept="image/*" className="hidden" onChange={handlePick} />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Adjust photo</DialogTitle>
          </DialogHeader>

          {rawImage && (
            <div className="relative h-80 w-full overflow-hidden rounded-lg bg-black">
              <Cropper
                image={rawImage}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                cropShape={round ? "round" : "rect"}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_area, areaPixels) => setCroppedAreaPixels(areaPixels)}
              />
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <span className="text-xs text-muted-foreground">Zoom</span>
            <Slider
              min={1}
              max={3}
              step={0.01}
              value={[zoom]}
              onValueChange={(v) => setZoom(Array.isArray(v) ? v[0] : v)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleConfirmCrop}>
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
