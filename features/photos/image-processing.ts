"use client";

import { photoGuidelines } from "@/features/photos/photo-guidelines";

export type ProcessedImage = {
  byteSize: number;
  file: File;
  height: number;
  mimeType: string;
  width: number;
};

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

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, photoGuidelines.outputMimeType, photoGuidelines.webpQuality),
  );

  if (!blob) {
    return {
      byteSize: file.size,
      file,
      height: sourceHeight,
      mimeType: file.type,
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
    width,
  };
}
