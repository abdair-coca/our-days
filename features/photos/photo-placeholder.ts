/** A tiny base64 JPEG/WebP/PNG (≈20 px wide) painted while the real photo loads. */
export const MAX_PLACEHOLDER_LENGTH = 3000;

const PLACEHOLDER_PATTERN = /^data:image\/(?:jpeg|webp|png);base64,[A-Za-z0-9+/]+={0,2}$/;

export function isPhotoPlaceholder(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length <= MAX_PLACEHOLDER_LENGTH &&
    PLACEHOLDER_PATTERN.test(value)
  );
}
