import type { NextConfig } from 'next';

const isGitHubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: isGitHubPages ? "/edda-survey" : "",
  assetPrefix: isGitHubPages ? "/edda-survey/" : "",
};

export default nextConfig;
