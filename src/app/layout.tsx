import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kalender Akademik",
  description: "Kalender akademik bilingual Arab dan Indonesia"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
