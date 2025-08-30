import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "place.pusan.ac.kr",
        port: "",
        pathname: "/PUSAN_MOBILE/images/**",
      },
      {
        protocol: "http",
        hostname: "place.pusan.ac.kr",
        port: "",
        pathname: "/PUSAN_MOBILE/images/**",
      },
    ],
  },
};

export default withSentryConfig(
  nextConfig,
  {
    silent: true,
    org: "zuraft",
    project: "pnu-blace",
  },
  {
    widenClientFileUpload: true,
    transpileClientSDK: true,
    hideSourceMaps: true,
    disableLogger: true,
    automaticVercelMonitors: true,
  }
);
