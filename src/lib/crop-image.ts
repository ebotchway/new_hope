import type { Area } from "react-easy-crop";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", reject);
    img.crossOrigin = "anonymous";
    img.src = src;
  });
}

export async function getCroppedImageFile(
  imageSrc: string,
  croppedAreaPixels: Area,
  fileName: string,
  mimeType = "image/jpeg"
): Promise<File> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = croppedAreaPixels.width;
  canvas.height = croppedAreaPixels.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  ctx.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    croppedAreaPixels.width,
    croppedAreaPixels.height
  );

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mimeType, 0.9));
  if (!blob) throw new Error("Could not crop image");

  return new File([blob], fileName, { type: mimeType });
}
