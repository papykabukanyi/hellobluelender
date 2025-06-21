import { Metadata } from 'next';
import { Suspense } from 'react';
import ApplicationClient from '@/components/ApplicationClient';

export const metadata: Metadata = {
  title: 'Apply for Financing | Hempire Enterprise',
  description: 'Apply online for business financing or equipment loans with Hempire Enterprise. Our simple application process makes it easy to get the funding your business needs.',
};

// For Next.js 15.3+, we wrap the client component in a Suspense boundary
export default function Application() {
  return (
    <>
      <section className="bg-gray-50 py-12">
        <div className="container-custom">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Financing Application</h1>
          <p className="text-gray-600 mb-0">
            Apply for financing with our simple online application
          </p>
        </div>
      </section>

      <section className="py-12">
        <Suspense fallback={<div className="container-custom text-center py-8">Loading application form...</div>}>
          <ApplicationClient />
        </Suspense>
      </section>
    </>
  );
}
