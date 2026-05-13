import type { Metadata, Viewport } from "next";
import { Noto_Kufi_Arabic } from "next/font/google";
import { SessionProvider } from "@/components/session-provider";
import "./globals.css";

const notoKufiArabic = Noto_Kufi_Arabic({
  subsets: ["arabic", "latin"],
  variable: "--font-noto-kufi-arabic",
  weight: ["400", "500", "600", "700", "800", "900"]
});

export const metadata: Metadata = {
  title: "Kalender Akademik",
  description: "Kalender akademik bilingual Arab dan Indonesia"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" suppressHydrationWarning>
      <body className={notoKufiArabic.variable}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
