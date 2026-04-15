import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "OCN | Organic Consciousness Network",
  description: "A natural social experience based on universal human actions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="organic-transition">
        <div className="aura-bg" />
        <main>{children}</main>
      </body>
    </html>
  );
}
