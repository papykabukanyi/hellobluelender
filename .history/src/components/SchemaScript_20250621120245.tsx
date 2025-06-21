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
  // Financial Product schema for hemp business loans
  const financialProductSchema = {
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    name: 'Hemp Business Financing',
    category: 'Business Loan',
    provider: {
      '@type': 'FinancialService',
      name: 'Hempire Enterprise',
      url: 'https://www.hempireenterprise.com'
    },
    description: 'Tailored financing solutions for hemp and cannabis businesses with competitive rates and quick approvals.',
    feesAndCommissionsSpecification: 'No hidden fees. Origination fee ranges from 1.5-3% depending on loan amount and term.',
    interestRate: '5.99% - 18.99% APR',
    loanTerm: '12-60 months',
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      priceSpecification: {
        '@type': 'PriceSpecification',
        minPrice: '25000',
        maxPrice: '500000'
      }
    }
  };

  // FAQ schema for common hemp financing questions
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Do you provide financing for cannabis businesses?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, Hempire Enterprise specializes in providing financing solutions for both hemp and cannabis businesses, including cultivation, processing, retail, and ancillary services.'
        }
      },
      {
        '@type': 'Question',
        name: 'What documents do I need to apply for hemp business financing?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'To apply, you\'ll need your business license/registration, government-issued ID, business bank statements (last 3 months), and proof of business ownership. Additional industry-specific licenses may be required.'
        }
      },
      {
        '@type': 'Question',
        name: 'How long does the approval process take?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Our specialized hemp industry financing approval process typically takes 24-48 hours, with funding available within 3-5 business days after approval.'
        }
      },
      {
        '@type': 'Question',
        name: 'What types of equipment can I finance for my hemp business?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We offer financing for a wide range of hemp industry equipment including cultivation systems, extraction equipment, processing machinery, drying systems, testing equipment, and packaging machinery.'
        }
      }
    ]
  };

  // Article schema for hemp industry insights
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Navigating Financing Options in the Hemp Industry',
    description: 'Learn about the specialized financing options available for hemp businesses and how to secure the right funding for your operation.',
    image: 'https://www.hempireenterprise.com/blog/hemp-financing-guide.jpg',
    author: {
      '@type': 'Organization',
      name: 'Hempire Enterprise'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Hempire Enterprise',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.hempireenterprise.com/favicon.svg'
      }
    },
    datePublished: '2025-06-01T08:00:00+08:00',
    dateModified: '2025-06-15T09:20:00+08:00'
  };

  return (
    <>
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <Script
        id="financial-product-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(financialProductSchema) }}
      />
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Script
        id="article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
    </>
  );
}
