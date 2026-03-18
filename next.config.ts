import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // API 라우트(/api/leads, /api/admin/leads) 사용을 위해 output: "export" 제거
  // 정적 내보내기가 필요하면 Vercel 등 Node 서버 지원 플랫폼에 배포하세요.
  images: {
    unoptimized: true,
    remotePatterns: [{ protocol: "https", hostname: "placehold.co", pathname: "/**" }],
  },
};

export default nextConfig;
