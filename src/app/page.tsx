import Link from "next/link";
import GradientBackground from "@/components/GradientBackground";
import ApplyNowButton from "@/components/ApplyNowButton";
import SEOMeta from "@/components/SEOMeta";

export default function Home() {
  const homePageSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Empire Entreprise",
    "alternateName": "Hempire Enterprise",
    "description": "Leading business financing company providing equipment loans, working capital, SBA loans, and business expansion funding with fast approval and competitive rates",
    "url": "https://empire-entreprise.com",
    "logo": "https://empire-entreprise.com/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "(123) 456-7890",
      "contactType": "Customer Service",
      "email": "papy@hempire-enterprise.com",
      "availableLanguage": ["English"],
      "areaServed": "US"
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "US"
    },
    "sameAs": [
      "https://www.linkedin.com/company/empire-entreprise",
      "https://www.facebook.com/empireentreprise",
      "https://twitter.com/empireentreprise"
    ]
  };

  return (
    <>
      <SEOMeta
        title="Business Loans & Equipment Financing - Fast Approval | Empire Entreprise"
        description="Get business loans $5K-$10M with 24-48 hour approval. Equipment financing, working capital, SBA loans. Licensed in all 50 states. Apply online today!"
        keywords="business loans, equipment financing, working capital loans, SBA loans, business financing, small business loans, commercial loans, business expansion loans"
        canonicalUrl="https://empire-entreprise.com"
        schema={homePageSchema}
      />
      
      {/* Hero Section */}
      <section 
        style={{ marginTop: '-4rem' }} // To compensate for the navbar
      >
        <div className="relative h-screen flex items-center justify-center">
          <GradientBackground className="absolute inset-0" />
          <div className="container-custom z-10 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
              Growing Your Business <br /> Starts Here
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-white">
              <span className="font-permanentMarker text-2xl md:text-3xl">Hempire Enterprise</span> offers flexible financing solutions for businesses of all sizes.
              Get the funds you need to expand, upgrade equipment, or manage cash flow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <ApplyNowButton 
                href="/application" 
                className="btn-primary text-lg px-8 py-3 hover:scale-105 transition-transform"
              >
                Apply Now
              </ApplyNowButton>
              <Link href="/info" className="btn-outline text-lg px-8 py-3 text-white border-white hover:bg-white hover:bg-opacity-10 transition-colors">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Loan Types Section */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Our Financing Solutions</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Business Loan Card */}
            <div className="card hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-bold mb-4">Business Financing</h3>
              <p className="mb-4 text-gray-600">
                Get the working capital your business needs to grow, expand, or manage seasonal cash flow fluctuations.
                Our business financing options are designed to be flexible and accessible.
              </p>
              <ul className="mb-6 space-y-2 text-gray-600">
                <li>• Quick approval process</li>
                <li>• Flexible repayment terms</li>
                <li>• Competitive rates</li>
                <li>• No hidden fees</li>
              </ul>
              <ApplyNowButton 
                href="/application?type=business" 
                className="btn-primary inline-block hover:scale-105 transition-transform"
              >
                Apply for Business Financing
              </ApplyNowButton>
            </div>
            
            {/* Equipment Loan Card */}
            <div className="card hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-bold mb-4">Equipment Financing</h3>
              <p className="mb-4 text-gray-600">
                Upgrade your equipment without depleting your cash reserves. Our equipment financing solutions
                help you acquire the tools you need to stay competitive and efficient.
              </p>
              <ul className="mb-6 space-y-2 text-gray-600">
                <li>• Finance new or used equipment</li>
                <li>• Fixed monthly payments</li>
                <li>• Tax advantages</li>
                <li>• Preserve your capital</li>
              </ul>
              <ApplyNowButton 
                href="/application?type=equipment" 
                className="btn-primary inline-block hover:scale-105 transition-transform"
              >
                Apply for Equipment Financing
              </ApplyNowButton>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20">
        <div className="container-custom">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Why Choose <span className="font-permanentMarker">Hempire Enterprise</span></h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Fast Approvals</h3>
              <p className="text-gray-600">Quick application process with decisions often made within 24-48 hours.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Competitive Rates</h3>
              <p className="text-gray-600">We offer some of the most competitive rates in the industry for qualified businesses.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Dedicated Support</h3>
              <p className="text-gray-600">Our team of financial experts is here to guide you through every step of the process.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Ready to Take the Next Step?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Apply today and get the financing your business needs to succeed.
          </p>
          <ApplyNowButton 
            href="/application" 
            className="btn-outline text-white border-white text-lg px-8 py-3 hover:bg-white hover:text-primary hover:bg-opacity-90 transition-colors"
          >
            Start Your Application
          </ApplyNowButton>
        </div>
      </section>
    </>
  );
}
