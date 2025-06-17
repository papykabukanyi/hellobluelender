'use client';

import Script from 'next/script';

export default function SchemaScript() {
  // Organization schema
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'FinancialService',
    name: 'Blue Lender',
    url: 'https://www.bluelender.com',
    logo: 'https://www.bluelender.com/favicon.svg',
    description: 'Blue Lender provides flexible financing solutions for businesses. Apply online for equipment loans or business funding with competitive rates and quick approvals.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '123 Main Street',
      addressLocality: 'New York',
      addressRegion: 'NY',
      postalCode: '10001',
      addressCountry: 'US'
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-555-123-4567',
      contactType: 'customer service'
    },
    sameAs: [
      'https://www.facebook.com/bluelender',
      'https://twitter.com/bluelender',
      'https://www.linkedin.com/company/bluelender'
    ],
    areaServed: 'US',
    priceRange: '$$'
  };

  return (
    <Script
      id="schema-org-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
    />
  );
}
