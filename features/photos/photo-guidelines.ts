export const photoGuidelines = {
  acceptedTypes: ["image/jpeg", "image/png", "image/webp"],
  maxFiles: 10,
  maxLongEdgePixels: 2000,
  maxSourceSizeBytes: 12 * 1024 * 1024,
  outputMimeType: "image/webp",
  targetSizeLabel: "300 KB–1 MB",
  webpQuality: 0.82,
} as const;
