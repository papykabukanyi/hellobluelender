import type { Metadata } from "next";
import { Inter, Permanent_Marker } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { NextSeo } from "next-seo";
import InitializeApp from "@/components/InitializeApp";
import SchemaScript from "@/components/SchemaScript";
import CookieConsent from "@/components/CookieConsent";
import ChatBot from "@/components/ChatBot";

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
  // Use this function to determine if we're on an admin page
  // We have to use a function since we can't use hooks like usePathname in a server component
  function getPageContent() {
    // Check if the URL contains admin (this must be done client-side)
    return (
      <>
        <SchemaScript />
        <InitializeApp />
        <div id="nav-placeholder" suppressHydrationWarning>
          <Navbar />
        </div>
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        <CookieConsent />
        <ChatBot />
        
        {/* Client-side script to remove navbar and adjust layout for admin pages */}
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const isAdminPage = window.location.pathname.startsWith('/admin');
              if (isAdminPage) {
                // Remove navbar for admin pages
                const navPlaceholder = document.getElementById('nav-placeholder');
                if (navPlaceholder) navPlaceholder.innerHTML = '';
                
                // Remove padding that was added for navbar
                const mainElement = document.querySelector('main');
                if (mainElement) mainElement.classList.remove('pt-16');
                
                // Hide chatbot on admin pages
                const chatElements = document.querySelectorAll('[class*="fixed bottom-5"]'); // Target chatbot elements
                chatElements.forEach(el => {
                  if (el.tagName === 'BUTTON') el.style.display = 'none';
                });
              }
            })();
          `
        }} />
      </>
    );
  }
  
  return (
    <html lang="en" className={`${inter.variable} ${permanentMarker.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap" rel="stylesheet" />
      </head>
      <body className="flex flex-col min-h-screen">
        {getPageContent()}
      </body>
    </html>
  );
}
