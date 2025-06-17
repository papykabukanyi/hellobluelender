import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { NextSeo } from "next-seo";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Blue Lender - Business & Equipment Financing Solutions",
  description: "Blue Lender provides flexible financing solutions for businesses. Apply online for equipment loans or business funding with competitive rates and quick approvals.",
  keywords: "business loans, equipment financing, business funding, commercial loans, small business loans, equipment leasing",
  authors: [{ name: "Blue Lender" }],
  alternates: {
    canonical: "https://www.bluelender.com",
  },
  metadataBase: new URL('https://www.bluelender.com'),
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' }
    ],
    apple: [
      { url: '/favicon.svg', type: 'image/svg+xml' }
    ]
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.bluelender.com",
    title: "Blue Lender - Business & Equipment Financing Solutions",
    description: "Blue Lender provides flexible financing solutions for businesses. Apply online for equipment loans or business funding with competitive rates and quick approvals.",
    siteName: "Blue Lender",
    images: [
      {
        url: "https://www.bluelender.com/hero-background.svg",
        width: 1200,
        height: 600,
        alt: "Blue Lender",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blue Lender - Business & Equipment Financing Solutions",
    description: "Blue Lender provides flexible financing solutions for businesses. Apply online for equipment loans or business funding with competitive rates and quick approvals.",
    creator: "@bluelender",
    images: ["https://www.bluelender.com/hero-background.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
