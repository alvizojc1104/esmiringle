import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://esmiringle.onrender.com";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "esmiringle — Talk to Strangers Live",
    template: "%s | esmiringle",
  },
  description:
    "Free, safe, and anonymous 1-on-1 live text chat. Connect with strangers instantly — no registration, no accounts, just tap and start chatting.",
  applicationName: "esmiringle",
  keywords: [
    "esmiringle",
    "talk to strangers",
    "anonymous chat",
    "live text chat",
    "random chat",
    "omegle alternative",
    "philippines stranger chat",
    "bisaya chat",
    "free random chat",
    "safe anonymous chat",
  ],
  authors: [{ name: "quickchow" }],
  creator: "quickchow",
  publisher: "esmiringle",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["fil_PH"],
    url: siteUrl,
    siteName: "esmiringle",
    title: "esmiringle — Talk to Strangers Live",
    description:
      "Free, safe, and anonymous 1-on-1 live text chat. Connect with strangers instantly without accounts or downloads.",
    images: [
      {
        url: "/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "esmiringle logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "esmiringle — Talk to Strangers Live",
    description:
      "Free, safe, and anonymous 1-on-1 live text chat. Connect with strangers instantly without accounts or downloads.",
    images: ["/android-chrome-512x512.png"],
    creator: "@quickchow",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 min-h-screen transition-colors duration-150">
        {children}
      </body>
    </html>
  );
}
