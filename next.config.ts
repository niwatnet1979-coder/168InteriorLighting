import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: 'export', // บังคับให้ Build เป็น HTML Static File
  images: {
    unoptimized: true,
  },
  basePath: isProd ? '/168go' : '', // ใช้ basePath เฉพาะ production เท่านั้น
};

export default nextConfig;
