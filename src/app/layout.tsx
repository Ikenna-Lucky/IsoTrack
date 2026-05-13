import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { AuthProvider } from "@/providers/auth-provider";
import { QueryProvider } from "@/providers/query-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "IsoTrack — Real-Time Shipment Tracking",
    template: "%s | IsoTrack",
  },
  description:
    "Enterprise-grade logistics and shipment tracking platform. Track deliveries in real time, automate notifications, and manage your entire fleet from one dashboard.",
  keywords: ["logistics", "shipment tracking", "delivery management", "fleet tracking", "real-time"],
  authors: [{ name: "IsoTrack" }],
  creator: "IsoTrack",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: "IsoTrack — Real-Time Shipment Tracking",
    description:
      "Enterprise-grade logistics and shipment tracking platform. Track deliveries in real time.",
    siteName: "IsoTrack",
  },
  twitter: {
    card: "summary_large_image",
    title: "IsoTrack — Real-Time Shipment Tracking",
    description: "Enterprise-grade logistics and shipment tracking platform.",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
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

export const viewport: Viewport = {
  themeColor: "#09090b",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
