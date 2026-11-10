import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/session";
import { MediaLibrary, MediaAssetItem } from "@/components/admin/cms/media-library";

export const metadata = {
  title: "Media Library | LivingHope Admin",
};

export default async function AdminMediaPage() {
  await requireStaff();

  const assets = await prisma.cmsMediaAsset.findMany({
    orderBy: { createdAt: "desc" },
  });

  const formattedAssets: MediaAssetItem[] = assets.map((a) => ({
    id: a.id,
    url: a.url,
    filename: a.filename,
    originalName: a.originalName,
    mimeType: a.mimeType,
    sizeBytes: a.sizeBytes,
    width: a.width,
    height: a.height,
    altText: a.altText,
    caption: a.caption,
    folder: a.folder,
    createdAt: a.createdAt,
  }));

  return <MediaLibrary initialAssets={formattedAssets} />;
}

