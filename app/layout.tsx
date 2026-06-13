import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import { siteTitle, titleTemplate } from "@/lib/metadata";
import { PWA_THEME_COLOR, pwaAppleWebApp, pwaManifest } from "@/lib/pwa/config";
import { siteConfig } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteTitle,
    template: titleTemplate,
  },
  description: siteConfig.description,
  applicationName: pwaManifest.short_name,
  manifest: "/manifest.webmanifest",
  appleWebApp: pwaAppleWebApp,
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.ogTitle,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary",
    title: siteConfig.ogTitle,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-64.png", sizes: "64x64", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/icons/icon-180.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-title": pwaAppleWebApp.title,
    "apple-mobile-web-app-status-bar-style": pwaAppleWebApp.statusBarStyle,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: PWA_THEME_COLOR },
    { media: "(prefers-color-scheme: dark)", color: "#141820" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-dvh flex-col font-sans">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
