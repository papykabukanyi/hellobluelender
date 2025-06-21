import { Metadata } from 'next';
import { LoanType } from '@/types';
import ApplicationForm from '@/components/ApplicationForm';

export const metadata: Metadata = {
  title: 'Apply for Financing | Hempire Enterprise',
  description: 'Apply online for business financing or equipment loans with Hempire Enterprise. Our simple application process makes it easy to get the funding your business needs.',
};

export default function Application({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {  // Get loan type from URL query params - must be synchronous in Next.js 15.3+
  // searchParams is already available, don't use await
  const typeParam = searchParams.type;
  const type = Array.isArray(typeParam) ? typeParam[0] : typeParam;
  
  // Determine the loan type based on query parameter
  const loanType: LoanType = 
    typeof type === 'string' && 
    ['business', 'equipment'].includes(type.toLowerCase()) 
      ? (type.toLowerCase() === 'business' ? 'Business' : 'Equipment') 
      : 'Business';

  return (
    <>
      <section className="bg-gray-50 py-12">
        <div className="container-custom">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Financing Application</h1>
          <p className="text-gray-600 mb-0">
            Apply for {loanType} financing with our simple online application
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container-custom">
          <ApplicationForm />
        </div>
      </section>
    </>
  );
}
