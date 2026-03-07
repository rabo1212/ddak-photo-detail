import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "딱포토 - AI 상세페이지 생성기",
  description: "누끼 사진만 올리면, AI가 연출하고 상세페이지까지 완성!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-mesh min-h-screen`}
      >
        <header className="glass border-b border-white/40 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-raised">
              <span className="text-primary-foreground font-bold text-sm">D</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-lg tracking-tight text-gradient">딱포토</span>
              <span className="text-[11px] text-muted-foreground font-medium tracking-wide uppercase hidden sm:inline">AI 상세페이지 생성기</span>
            </div>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
