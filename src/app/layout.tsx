import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

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
  themeColor: "#000000",
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
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
