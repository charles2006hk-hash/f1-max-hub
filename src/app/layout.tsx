import type { Metadata } from "next";
import "./globals.css";

// 網址預覽與搜尋引擎最佳化 (SEO) 設定
export const metadata: Metadata = {
  title: "MAX33 | 2026 F1 Era",
  description: "The ultimate 2026 tech and race hub for Max Verstappen. Live telemetry, paddock feed, and news.",
  openGraph: {
    title: "MAX33 | The Next Era of Super Max",
    description: "Witness the 2026 F1 rules evolution. Live telemetry, paddock feed, and the latest Red Bull Racing news.",
    // 當你把網址貼給別人時，會自動顯示這張帥氣的圖片！
    images: [
      {
        url: "https://images.unsplash.com/photo-1541336032412-2048a678540d?q=80&w=1200&auto=format&fit=crop",
        width: 1200,
        height: 630,
        alt: "MAX33 2026 Era",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-950 text-slate-200">
        {children}
      </body>
    </html>
  );
}