"use client";

import { photoGuidelines } from "@/features/photos/photo-guidelines";
import { isPhotoPlaceholder } from "@/features/photos/photo-placeholder";

export type ProcessedImage = {
  byteSize: number;
  file: File;
  height: number;
  mimeType: string;
  /** Tiny blurred preview; absent when the browser cannot produce one. */
  placeholder?: string;
  width: number;
};

const PLACEHOLDER_WIDTH = 20;

/** Downscales an already-drawn canvas into a ~1 KB data URL. */
function createPlaceholder(source: HTMLCanvasElement): string | undefined {
  try {
    const width = PLACEHOLDER_WIDTH;
    const height = Math.max(1, Math.round((source.height / source.width) * width));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return undefined;
    context.imageSmoothingQuality = "high";
    context.drawImage(source, 0, 0, width, height);
    const value = canvas.toDataURL("image/jpeg", 0.55);
    return isPhotoPlaceholder(value) ? value : undefined;
  } catch {
    return undefined;
  }
}

export async function processImage(file: File): Promise<ProcessedImage> {
  const bitmap = await createImageBitmap(file);
  const sourceWidth = bitmap.width;
  const sourceHeight = bitmap.height;
  const scale = Math.min(
    1,
    photoGuidelines.maxLongEdgePixels / Math.max(bitmap.width, bitmap.height),
  );
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");

  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  context?.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  if (!context) {
    return {
      byteSize: file.size,
      file,
      height: sourceHeight,
      mimeType: file.type,
      width: sourceWidth,
    };
  }

  const placeholder = createPlaceholder(canvas);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, photoGuidelines.outputMimeType, photoGuidelines.webpQuality),
  );

  if (!blob) {
    return {
      byteSize: file.size,
      file,
      height: sourceHeight,
      mimeType: file.type,
      placeholder,
      width: sourceWidth,
    };
  }

  const outputName = file.name.replace(/\.[^/.]+$/, "") || "our-days-photo";
  const processedFile = new File([blob], `${outputName}.webp`, {
    lastModified: Date.now(),
    type: photoGuidelines.outputMimeType,
  });

  return {
    byteSize: processedFile.size,
    file: processedFile,
    height,
    mimeType: processedFile.type,
    placeholder,
    width,
  };
}
