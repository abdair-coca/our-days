import { ImageResponse } from "next/og";

export const size = {
  height: 180,
  width: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <svg height="180" viewBox="0 0 64 64" width="180" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="warm" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
            <stop stopColor="#EAA99D" />
            <stop offset="1" stopColor="#9B4F55" />
          </linearGradient>
        </defs>
        <rect fill="#F7F1E8" height="64" rx="16" width="64" />
        <path d="M32 55C23 48 8 38 8 23 8 14 14 9 22 9c5 0 8 2 10 6 2-4 5-6 10-6 8 0 14 5 14 14 0 15-15 25-24 32Z" fill="url(#warm)" />
      </svg>
    ),
    size,
  );
}
