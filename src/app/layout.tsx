import type { Metadata } from "next";
import { Inter, Permanent_Marker } from "next/font/google";
import "./globals.css";
// TEMPORARILY DISABLED FOR BUILD FIX
// import Footer from "@/components/Footer";
// import ConditionalFooter from "@/components/ConditionalFooter";
// import InitializeApp from "@/components/InitializeApp";
// import SchemaScript from "@/components/SchemaScript";
// import CookieConsent from "@/components/CookieConsent";
// import ConditionalNavbar from "@/components/ConditionalNavbar";
// import ConditionalChatBot from "@/components/ConditionalChatBot";

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
    default: 'HELLO BLUE LENDERS | Premium Lending Solutions',
    template: '%s | HELLO BLUE LENDERS'
  },
  description: "Premium lending solutions with the power of blue. Fast approval, competitive rates, and exceptional service for your business financing needs.",
  keywords: "blue lenders, premium lending, business loans, equipment financing, business funding, commercial loans, small business loans, lending solutions",
  category: "finance",
  applicationName: "HELLO BLUE LENDERS",
  authors: [{ name: "HELLO BLUE LENDERS", url: "https://www.hellobluelenders.com" }],
  alternates: {
    canonical: "https://www.hellobluelenders.com",
  },
  metadataBase: new URL('https://www.hellobluelenders.com'),
  icons: {
    icon: [
      { url: '/favicon-blue.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' }
    ],
    apple: [
      { url: '/favicon-blue.svg', type: 'image/svg+xml' }
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
    url: "https://www.hellobluelenders.com",
    title: "HELLO BLUE LENDERS | Premium Lending Solutions",
    description: "Premium lending solutions with the power of blue. Fast approval, competitive rates, and exceptional service for your business financing needs.",
    siteName: "HELLO BLUE LENDERS",
    images: [
      {
        url: "https://www.hellobluelenders.com/hero-background.jpg",
        width: 1200,
        height: 630,
        alt: "HELLO BLUE LENDERS",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HELLO BLUE LENDERS | Premium Lending Solutions",
    description: "Premium lending solutions with the power of blue. Fast approval, competitive rates, and exceptional service for your business financing needs.",
    creator: "@hellobluelenders",
    images: ["https://www.hellobluelenders.com/hero-background.jpg"],
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
        {/* TEMPORARILY DISABLED FOR BUILD FIX */}
        {/* <SchemaScript /> */}
        {/* <InitializeApp /> */}
        {/* <ConditionalNavbar /> */}
        <main className="flex-grow">
          {children}
        </main>
        {/* <ConditionalFooter /> */}
        {/* <CookieConsent /> */}
        {/* <ConditionalChatBot /> */}
      </body>
    </html>
  );
}
