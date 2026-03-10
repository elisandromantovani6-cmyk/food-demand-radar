import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdfjs-dist", "canvas", "@anthropic-ai/sdk"],
};

export default nextConfig;
