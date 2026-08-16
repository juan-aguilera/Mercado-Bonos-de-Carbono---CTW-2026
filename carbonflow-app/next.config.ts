import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: "/certificacion", destination: "/validacion-registro", permanent: false }];
  },
};

export default nextConfig;
