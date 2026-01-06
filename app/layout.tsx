import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/app-context";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://x402-navigate.vercel.app"),
  title: "x402 Discovery - Navigate and Discover the x402 Protocol",
  description: "An intuitive way to explore x402 documentation, examples, and guides. Find what you need based on your language, framework, and goals.",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "android-chrome-192x192",
        url: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        rel: "android-chrome-512x512",
        url: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "x402 Discovery - Navigate and Discover the x402 Protocol",
    description: "An intuitive way to explore x402 documentation, examples, and guides. Find what you need based on your language, framework, and goals.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "x402 Discovery",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "x402 Discovery - Navigate and Discover the x402 Protocol",
    description: "An intuitive way to explore x402 documentation, examples, and guides. Find what you need based on your language, framework, and goals.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppProvider>
          {children}
        </AppProvider>
        <Analytics />
      </body>
    </html>
  );
}
