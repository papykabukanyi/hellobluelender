import { Metadata } from 'next';
import Link from 'next/link';
import ApplicationSuccessClient from '@/components/ApplicationSuccessClient';

export const metadata: Metadata = {
  title: 'Application Submitted | Hempire Enterprise',
  description: 'Your financing application has been submitted successfully to Hempire Enterprise. Our team will review your application and contact you shortly.',
};

// For Next.js 15.3+, avoid using searchParams in Server Components
export default function ApplicationSuccess({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // We'll use client-side JavaScript to get the ID from the URL
  const applicationId = '';

  return (
    <>
      <section className="bg-gray-50 py-12">
        <div className="container-custom">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Application Submitted</h1>
          <p className="text-gray-600 mb-0">
            Thank you for submitting your financing application
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <div className="mx-auto bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Application Successfully Submitted!</h2>
              <p className="text-gray-600 mb-2">
                Your application has been received and is being processed. Our team will review your information
                and contact you shortly.
              </p>              
              <ApplicationSuccessClient />
            </div>
            
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4">What Happens Next?</h3>
              <div className="grid md:grid-cols-3 gap-6 text-left">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center justify-center bg-primary w-8 h-8 rounded-full text-white font-bold mb-3">
                    1
                  </div>
                  <h4 className="font-semibold mb-2">Application Review</h4>
                  <p className="text-gray-600 text-sm">
                    Our team reviews your application and documentation within 1-2 business days.
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center justify-center bg-primary w-8 h-8 rounded-full text-white font-bold mb-3">
                    2
                  </div>
                  <h4 className="font-semibold mb-2">Initial Contact</h4>
                  <p className="text-gray-600 text-sm">
                    A financing specialist will contact you to discuss your application and any additional requirements.
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center justify-center bg-primary w-8 h-8 rounded-full text-white font-bold mb-3">
                    3
                  </div>
                  <h4 className="font-semibold mb-2">Decision & Funding</h4>
                  <p className="text-gray-600 text-sm">
                    Once approved, you'll receive your financing offer, and upon acceptance, funds will be disbursed.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <Link href="/" className="btn-primary mr-4">
                Return to Home
              </Link>
              <Link href="/contact" className="btn-outline">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
