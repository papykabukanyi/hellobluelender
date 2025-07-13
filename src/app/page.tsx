import Link from "next/link";
import GradientBackground from "@/components/GradientBackground";
import ApplyNowButton from "@/components/ApplyNowButton";
import SEOMeta from "@/components/SEOMeta";

export default function Home() {
  const homePageSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Hello Blue Lenders",
    "alternateName": "Hello Blue Lenders",
    "description": "Premium lending solutions with the power of blue. Exceptional financing services, equipment loans, working capital, and business expansion funding with fast approval and competitive rates",
    "url": "https://hellobluelenders.com",
    "logo": "https://hellobluelenders.com/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "(555) 123-BLUE",
      "contactType": "Customer Service",
      "email": "info@hellobluelenders.com",
      "availableLanguage": ["English"],
      "areaServed": "US"
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "US"
    },
    "sameAs": [
      "https://www.linkedin.com/company/hello-blue-lenders",
      "https://www.facebook.com/hellobluelenders",
      "https://twitter.com/hellobluelenders"
    ]
  };

  return (
    <>
      <SEOMeta
        title="Premium Lending Solutions - Hello Blue Lenders | Fast Approval"
        description="Experience premium lending with the power of blue. Get business loans $5K-$10M with 24-48 hour approval. Equipment financing, working capital, exceptional service. Apply online today!"
        keywords="hello blue lenders, premium lending, business loans, equipment financing, working capital loans, blue lending solutions, commercial loans, business financing"
        canonicalUrl="https://hellobluelenders.com"
        schema={homePageSchema}
      />
      
      {/* Hero Section */}
      <section 
        style={{ marginTop: '-4rem' }} // To compensate for the navbar
      >
        <div className="relative min-h-screen flex items-center justify-center">
          <GradientBackground className="absolute inset-0" />
          <div className="container-custom z-10 text-center animate-fade-in">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 text-white leading-tight">
              Experience Premium Lending <br className="hidden sm:block" /> 
              <span className="text-blue-200">with the Power of Blue</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-6 md:mb-8 max-w-4xl mx-auto text-white px-4">
              <span className="font-permanentMarker text-xl sm:text-2xl md:text-3xl text-blue-300 block mb-2">Hello Blue Lenders</span> 
              delivers exceptional financing solutions that flow as smoothly as the deepest blue waters.
              Experience lending excellence with our premium blue-class service.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center px-4 animate-slide-up">
              <ApplyNowButton 
                href="/application" 
                className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 hover:scale-105 transition-transform"
              >
                Apply Now
              </ApplyNowButton>
              <Link href="/info" className="btn-outline text-base sm:text-lg px-6 sm:px-8 py-3 text-white border-white hover:bg-white hover:text-primary hover:bg-opacity-90 transition-colors">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Loan Types Section */}
      <section className="section-spacing bg-neutral-50">
        <div className="container-custom">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 md:mb-12 text-center animate-slide-up">Our Blue-Class Financing Solutions</h2>
          
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* Business Loan Card */}
            <div className="card hover:shadow-lg transition-all duration-300 animate-slide-up">
              <h3 className="text-xl md:text-2xl font-bold mb-4 text-primary">Premium Business Financing</h3>
              <p className="mb-4 text-neutral-700 leading-relaxed">
                Experience the depth and reliability of blue-ocean financing. Our premium business solutions 
                provide the capital flow your business needs to reach new horizons.
              </p>
              <ul className="mb-6 space-y-2 text-neutral-700">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-primary mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Lightning-fast approval
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-primary mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Blue-ribbon service
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-primary mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Crystal-clear terms
                </li>
              </ul>
              <ApplyNowButton 
                href="/application?type=business" 
                className="btn-primary w-full sm:w-auto hover:scale-105 transition-transform"
              >
                Apply for Business Financing
              </ApplyNowButton>
            </div>
            
            {/* Equipment Loan Card */}
            <div className="card hover:shadow-lg transition-all duration-300 animate-slide-up">
              <h3 className="text-xl md:text-2xl font-bold mb-4 text-primary">Blue-Chip Equipment Financing</h3>
              <p className="mb-4 text-neutral-700 leading-relaxed">
                Dive deep into equipment financing that's as reliable as the ocean blue. 
                Acquire the tools you need to navigate your business to success.
              </p>
              <ul className="mb-6 space-y-2 text-neutral-700">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-primary mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Finance new or used equipment
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-primary mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Fixed monthly payments
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-primary mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Tax advantages
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-primary mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Preserve your capital
                </li>
              </ul>
              <ApplyNowButton 
                href="/application?type=equipment" 
                className="btn-primary w-full sm:w-auto hover:scale-105 transition-transform"
              >
                Apply for Equipment Financing
              </ApplyNowButton>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="section-spacing bg-white">
        <div className="container-custom">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 md:mb-12 text-center animate-slide-up">
            Why Choose <span className="font-permanentMarker text-primary">Hello Blue Lenders</span>
          </h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="text-center p-4 animate-slide-up">
              <div className="bg-gradient-primary text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-soft">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-3 text-neutral-900">Fast Approvals</h3>
              <p className="text-neutral-700 leading-relaxed">Quick application process with decisions often made within 24-48 hours.</p>
            </div>
            
            <div className="text-center p-4 animate-slide-up">
              <div className="bg-gradient-primary text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-soft">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-3 text-neutral-900">Competitive Rates</h3>
              <p className="text-neutral-700 leading-relaxed">We offer some of the most competitive rates in the industry for qualified businesses.</p>
            </div>
            
            <div className="text-center p-4 animate-slide-up sm:col-span-2 lg:col-span-1">
              <div className="bg-gradient-primary text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-soft">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-3 text-neutral-900">Dedicated Support</h3>
              <p className="text-neutral-700 leading-relaxed">Our team of financial experts is here to guide you through every step of the process.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-spacing bg-gradient-primary text-white">
        <div className="container-custom text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6 text-white animate-slide-up">Ready to Take the Next Step?</h2>
          <p className="text-lg sm:text-xl mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed animate-slide-up">
            Apply today and get the financing your business needs to succeed.
          </p>
          <ApplyNowButton 
            href="/application" 
            className="btn-outline text-white border-white text-base sm:text-lg px-6 sm:px-8 py-3 hover:bg-white hover:text-primary hover:bg-opacity-90 transition-colors animate-bounce-gentle"
          >
            Start Your Application
          </ApplyNowButton>
        </div>
      </section>
    </>
  );
}
