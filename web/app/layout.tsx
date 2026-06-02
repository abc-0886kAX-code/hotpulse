import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/app-context";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "HotPulse — AI驱动的全球热点聚合",
  description: "AI-curated trending news from Reddit, Hacker News, Weibo, YouTube, and Twitter/X. Real-time stock indices. Bilingual zh/en.",
  openGraph: {
    title: "HotPulse — News · Mindset · Wealth",
    description: "AI-driven global trending news aggregation platform",
    url: "https://hotpulse-psi.vercel.app",
    siteName: "HotPulse",
    locale: "zh_CN",
    alternateLocale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "HotPulse",
    description: "AI-driven global trending news aggregation",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
        <AppProvider>
          <Navigation />
          <main>{children}</main>
        </AppProvider>
      </body>
    </html>
  );
}
