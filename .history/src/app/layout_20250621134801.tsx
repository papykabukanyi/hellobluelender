import type { Metadata } from "next";
import { Inter, Permanent_Marker } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { NextSeo } from "next-seo";
import InitializeApp from "@/components/InitializeApp";
import SchemaScript from "@/components/SchemaScript";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const permanentMarker = Permanent_Marker({
  weight: ["400"],
  subsets: ["latin"],
  display: "block", // Changed to block to ensure it loads visibly different
  variable: "--font-permanent-marker",
  fallback: ['cursive', 'Impact', 'Arial Black'],  // Fallbacks for better visibility
});

export const metadata: Metadata = {
  title: {
    default: 'Hempire Enterprise | Business & Equipment Financing Solutions',
    template: '%s | Hempire Enterprise'
  },
  description: "Specialized business and equipment financing solutions with fast approval, competitive rates, and industry expertise.",
  keywords: "business loans, equipment financing, business funding, commercial loans, small business loans, equipment leasing, working capital, enterprise financing",
  category: "finance",
  applicationName: "Hempire Enterprise",
  authors: [{ name: "Hempire Enterprise", url: "https://www.hempireenterprise.com" }],
  alternates: {
    canonical: "https://www.hempireenterprise.com",
  },
  metadataBase: new URL('https://www.hempireenterprise.com'),
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' }
    ],
    apple: [
      { url: '/favicon.svg', type: 'image/svg+xml' }
    ]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.hempireenterprise.com",
    title: "Hempire Enterprise | Business & Equipment Financing Solutions",
    description: "Specialized business and equipment financing solutions with fast approval, competitive rates, and industry expertise.",
    siteName: "Hempire Enterprise",
    images: [
      {
        url: "https://www.hempireenterprise.com/hero-background.jpg",
        width: 1200,
        height: 630,
        alt: "Hempire Enterprise",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hempire Enterprise | Business & Equipment Financing Solutions",
    description: "Specialized business and equipment financing solutions with fast approval, competitive rates, and industry expertise.",
    creator: "@hempireenterprise",
    images: ["https://www.hempireenterprise.com/hero-background.jpg"],
  },
  verification: {
    google: "google-site-verification-code",
    yandex: "yandex-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${permanentMarker.variable}`}>
      <body className="flex flex-col min-h-screen">
        <SchemaScript />
        <InitializeApp />
        <Navbar />
        <main className="flex-grow pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
