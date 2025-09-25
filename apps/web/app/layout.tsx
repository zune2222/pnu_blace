import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Header, Footer } from "@/widgets";
import { AnnouncementProvider } from "@/widgets/announcement";
import { QueryProvider } from "@/providers";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";

const geistSans = localFont({
  src: "../public/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "../public/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

const pretendard = localFont({
  src: [
    {
      path: "../public/Pretendard-Thin.woff2",
      weight: "100",
      style: "normal",
    },
    {
      path: "../public/Pretendard-ExtraLight.woff2",
      weight: "200",
      style: "normal",
    },
    {
      path: "../public/Pretendard-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/Pretendard-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/Pretendard-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/Pretendard-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/Pretendard-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/Pretendard-ExtraBold.woff2",
      weight: "800",
      style: "normal",
    },
    {
      path: "../public/Pretendard-Black.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-pretendard",
});

export const metadata: Metadata = {
  title: "PNU Blace",
  description: "부산대학교 도서관을 더욱 편리하게",
  keywords: ["부산대학교", "도서관", "좌석예약", "자동예약", "PNU", "Blace"],
  openGraph: {
    title: "PNU Blace",
    description: "부산대학교 도서관을 더욱 편리하게",
    images: [
      {
        url: "/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "PNU Blace 로고",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PNU Blace",
    description: "부산대학교 도서관을 더욱 편리하게",
    images: ["/android-chrome-512x512.png"],
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
  themeColor: "#ffffff",
  viewport: "width=device-width, initial-scale=1",
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
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster 
              richColors 
              position="bottom-right" 
              expand={true}
              visibleToasts={5}
            />
          </AnnouncementProvider>
        </QueryProvider>
        <Analytics />
      </body>
    </html>
  );
}
