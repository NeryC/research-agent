import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | Research Agent",
    default: "Research Agent — AI Web Research",
  },
  description:
    "Ask a research question. The agent searches the web, reads sources, and synthesizes a cited answer.",
  openGraph: {
    title: "Research Agent — AI Web Research",
    description:
      "Ask a research question. The agent searches the web, reads sources, and synthesizes a cited answer.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Research Agent — AI Web Research",
    description:
      "Ask a research question. The agent searches the web, reads sources, and synthesizes a cited answer.",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
