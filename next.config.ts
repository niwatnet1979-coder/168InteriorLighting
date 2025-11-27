import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // บังคับให้ Build เป็น HTML Static File
  images: {
    unoptimized: true, // จำเป็นสำหรับ GitHub Pages (เพราะไม่มี Image Optimization Server)
  },
  // ถ้าคุณ Deploy ไปที่ https://username.github.io/168InteriorLighting/
  // ต้องใส่ basePath: '/168InteriorLighting'
  // แต่ถ้าใช้ Custom Domain หรือ Root Domain ไม่ต้องใส่
  // เดี๋ยวเราลองแบบไม่ใส่ก่อน ถ้า CSS เพี้ยนค่อยมาแก้ครับ
};

export default nextConfig;
