import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const phudu = localFont({
  src: [{ path: "./fonts/Phudu-SemiBold.ttf", weight: "600", style: "normal" }],
  variable: "--font-phudu",
  display: "swap",
});

const inter = localFont({
  src: [
    { path: "./fonts/Inter-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Inter-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/Inter-SemiBold.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Apex — Let's build something cool",
  description: "Apex — smarter tools for modern finance teams.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${phudu.variable} ${inter.variable}`}>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
