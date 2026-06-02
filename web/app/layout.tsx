import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HotPulse",
  description: "AI-powered global trending news aggregation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body className="min-h-screen bg-[#0f0f1a] text-[#e0e0e0] antialiased" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
