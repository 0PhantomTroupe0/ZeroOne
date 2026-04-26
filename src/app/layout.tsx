import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";
import { UpdateNotifier } from "@/components/UpdateNotifier";


const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
});

export const metadata: Metadata = {
  title: "OCN | Organic Consciousness Network",
  description: "A natural social experience based on universal human actions.",
  icons: {
    icon: '/logo.jpg',
    apple: '/logo.jpg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${orbitron.variable}`}>
      <body className="organic-transition">
        <div className="aura-bg" />
        <main>{children}</main>
        <UpdateNotifier />
      </body>
    </html>
  );
}
