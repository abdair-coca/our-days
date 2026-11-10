import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    serverActions: {
      // New photos travel inside the save action. The 1 MB default rejected
      // memories with two or three photos; Vercel caps function payloads at
      // 4.5 MB, so the form also checks `photoGuidelines.maxUploadBytesPerSave`.
      // Long term, photos should upload straight to Storage from the browser.
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
