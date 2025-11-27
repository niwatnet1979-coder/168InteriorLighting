import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // บังคับให้ Build เป็น HTML Static File
  images: {
    unoptimized: true,
  },
  basePath: '/168InteriorLighting', // ระบุ Path ของ GitHub Pages
};

export default nextConfig;
