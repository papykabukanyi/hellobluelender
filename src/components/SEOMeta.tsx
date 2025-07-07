import Head from 'next/head';

interface SEOMetaProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  schema?: object;
  noIndex?: boolean;
}

export default function SEOMeta({
  title,
  description,
  keywords,
  canonicalUrl,
  ogImage = '/images/og-default.jpg',
  schema,
  noIndex = false
}: SEOMetaProps) {
  const fullTitle = title.includes('Empire Entreprise') 
    ? title 
    : `${title} | Empire Entreprise - Business Loans & Equipment Financing`;
  
  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"} />
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      <meta name="theme-color" content="#1F7832" />
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`https://empire-entreprise.com${ogImage}`} />
      <meta property="og:url" content={canonicalUrl || 'https://empire-entreprise.com'} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Empire Entreprise" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`https://empire-entreprise.com${ogImage}`} />
      <meta name="twitter:site" content="@EmpireEntreprise" />
      <meta name="twitter:creator" content="@EmpireEntreprise" />
      
      {/* Additional SEO Meta Tags */}
      <meta name="author" content="Empire Entreprise" />
      <meta name="publisher" content="Empire Entreprise" />
      <meta name="application-name" content="Empire Entreprise" />
      <meta name="apple-mobile-web-app-title" content="Empire Entreprise" />
      
      {/* Business Contact Information */}
      <meta name="contact" content="papy@hempire-enterprise.com" />
      <meta name="reply-to" content="papy@hempire-enterprise.com" />
      
      {/* Favicon and Icons */}
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <link rel="icon" type="image/png" href="/favicon.png" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      
      {/* Schema.org Structured Data */}
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}
      
      {/* Business Schema (Always Include) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FinancialService",
            "name": "Empire Entreprise",
            "description": "Fast business loans and equipment financing with competitive rates and quick approval",
            "url": "https://empire-entreprise.com",
            "logo": "https://empire-entreprise.com/logo.png",
            "image": "https://empire-entreprise.com/images/empire-entreprise-building.jpg",
            "telephone": "(123) 456-7890",
            "email": "papy@hempire-enterprise.com",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "US"
            },
            "priceRange": "$5,000 - $10,000,000",
            "openingHours": [
              "Mo-Fr 08:00-20:00",
              "Sa 09:00-17:00"
            ],
            "areaServed": {
              "@type": "Country",
              "name": "United States"
            },
            "serviceType": [
              "Business Loans",
              "Equipment Financing", 
              "Working Capital Loans",
              "SBA Loans",
              "Business Expansion Funding"
            ],
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "reviewCount": "247",
              "bestRating": "5",
              "worstRating": "1"
            }
          })
        }}
      />
    </Head>
  );
}
