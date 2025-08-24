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

export default nextConfig;
