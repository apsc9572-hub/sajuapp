import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // !! WARN !! 빌드 시 타입스크립트 에러를 무시합니다.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
