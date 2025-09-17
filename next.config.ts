import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@supabase/ssr", "@supabase/supabase-js"],
};

export default nextConfig;