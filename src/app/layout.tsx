import type { Metadata } from "next";
import { Inter, Permanent_Marker } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import ConditionalFooter from "@/components/ConditionalFooter";
import { NextSeo } from "next-seo";
import InitializeApp from "@/components/InitializeApp";
import SchemaScript from "@/components/SchemaScript";
import CookieConsent from "@/components/CookieConsent";
import ConditionalNavbar from "@/components/ConditionalNavbar";
import ConditionalChatBot from "@/components/ConditionalChatBot";

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
    default: 'EMPIRE ENTREPRISE | Business & Equipment Financing Solutions',
    template: '%s | EMPIRE ENTREPRISE'
  },
  description: "Specialized business and equipment financing solutions with fast approval, competitive rates, and industry expertise.",
  keywords: "business loans, equipment financing, business funding, commercial loans, small business loans, equipment leasing, working capital, enterprise financing",
  category: "finance",
  applicationName: "EMPIRE ENTREPRISE",
  authors: [{ name: "EMPIRE ENTREPRISE", url: "https://www.hempireenterprise.com" }],
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
    title: "EMPIRE ENTREPRISE | Business & Equipment Financing Solutions",
    description: "Specialized business and equipment financing solutions with fast approval, competitive rates, and industry expertise.",
    siteName: "EMPIRE ENTREPRISE",
    images: [
      {
        url: "https://www.hempireenterprise.com/hero-background.jpg",
        width: 1200,
        height: 630,
        alt: "EMPIRE ENTREPRISE",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EMPIRE ENTREPRISE | Business & Equipment Financing Solutions",
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap" rel="stylesheet" />
      </head>
      <body className="flex flex-col min-h-screen">
        <SchemaScript />
        <InitializeApp />
        <ConditionalNavbar />
        <main className="flex-grow">
          {children}
        </main>
        <ConditionalFooter />
        <CookieConsent />
        <ConditionalChatBot />
      </body>
    </html>
  );
}
