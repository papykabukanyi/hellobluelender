'use client';

import Script from 'next/script';

export default function SchemaScript() {
  // Organization schema for hemp financing business
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'FinancialService',
    name: 'Hempire Enterprise',
    url: 'https://www.hempireenterprise.com',
    logo: 'https://www.hempireenterprise.com/favicon.svg',
    description: 'Specialized business and equipment financing solutions for hemp and cannabis businesses. Fast approval, competitive rates, and industry expertise.',
    slogan: 'Growing the Future of Hemp Business Finance',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '420 Green Avenue',
      addressLocality: 'Portland',
      addressRegion: 'OR',
      postalCode: '97205',
      addressCountry: 'US'
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+1-555-420-7890',
        contactType: 'customer service',
        contactOption: 'TollFree',
        areaServed: 'US',
        availableLanguage: ['English', 'Spanish']
      },
      {
        '@type': 'ContactPoint',
        telephone: '+1-555-420-7891',
        contactType: 'sales',
        areaServed: 'US'
      }
    ],
    sameAs: [
      'https://www.facebook.com/hempireenterprise',
      'https://twitter.com/hempireenterprise',
      'https://www.linkedin.com/company/hempireenterprise',
      'https://www.instagram.com/hempireenterprise'
    ],
    areaServed: {
      '@type': 'GeoCircle',
      geoMidpoint: {
        '@type': 'GeoCoordinates',
        latitude: 39.8283,
        longitude: -98.5795
      },
      geoRadius: '5000 km'
    },
    priceRange: '$$-$$$',
    knowsAbout: [
      'Hemp Business Financing',
      'Cannabis Industry Loans',
      'CBD Business Funding',
      'Hemp Cultivation Equipment Financing',
      'Cannabis Retail Loans'
    ]
  };

  return (
    <Script
      id="schema-org-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
    />
  );
}
