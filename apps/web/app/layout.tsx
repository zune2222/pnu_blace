import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Suspense } from "react";
import { Header, Footer, BottomNavigation } from "@/widgets";
import { AnnouncementProvider } from "@/widgets/announcement";
import { QueryProvider, AnalyticsProvider } from "@/providers";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { NativeBridgeInitializer } from "@/shared/lib/native-bridge-initializer";

const geistSans = localFont({
  src: "../public/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "../public/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

const pretendard = localFont({
  src: "../public/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://pnublace.com'),
  title: "PNU Blace",
  description: "부산대학교 도서관을 더욱 편리하게",
  keywords: ["부산대학교", "도서관", "좌석예약", "자동예약", "PNU", "Blace"],
  openGraph: {
    title: "PNU Blace",
    description: "부산대학교 도서관을 더욱 편리하게",
    locale: "ko_KR",
    type: "website",
    siteName: "PNU Blace",
  },
  twitter: {
    card: "summary_large_image",
    title: "PNU Blace",
    description: "부산대학교 도서관을 더욱 편리하게",
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "android-chrome-192x192",
        url: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        rel: "android-chrome-512x512", 
        url: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },
  manifest: "/site.webmanifest",
};

// Next.js 15: viewport 메타데이터 분리
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ffffff",
};

// 다크 모드 초기화 스크립트 (번쩍임 방지)
const themeScript = `
  (function() {
    try {
      function getThemePreference() {
        if (typeof localStorage !== 'undefined') {
          const saved = localStorage.getItem('theme');
          if (saved === 'dark' || saved === 'light') {
            return saved;
          }
        }
        // 시스템 설정 확인 (저장된 설정이 없을 때만)
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      
      const theme = getThemePreference();
      const root = document.documentElement;
      
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      
      // color-scheme 설정으로 브라우저 기본 스타일도 변경
      root.style.colorScheme = theme;
    } catch (e) {
      // 에러 발생 시 기본 라이트 모드
      console.warn('Theme initialization failed:', e);
    }
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${pretendard.variable} ${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <QueryProvider>
          <AnnouncementProvider>
            <div className="min-h-screen bg-background text-foreground flex flex-col">
              <Header />
              <main className="flex-1 pb-16 md:pb-0">{children}</main>
              <div className="hidden md:block">
                <Footer />
              </div>
              <BottomNavigation />
            </div>
            <Toaster
              richColors
              position="top-center"
              expand={true}
              visibleToasts={3}
            />
          </AnnouncementProvider>
          <Suspense fallback={null}>
            <AnalyticsProvider />
          </Suspense>
          <NativeBridgeInitializer />
        </QueryProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
