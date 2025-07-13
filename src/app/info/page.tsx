import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Financial Information | Hello Blue Lenders',
  description: 'Discover premium lending solutions with the power of blue. Learn about our blue-class business financing and equipment loans designed for your success.',
};

export default function Info() {
  return (
    <>
      <section className="bg-gray-50 page-header-section">
        <div className="container-custom">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Blue-Class Financial Information</h1>
          <p className="text-gray-600 mb-0">
            Discover how our premium blue lending solutions can elevate your business to new heights
          </p>
        </div>
      </section>

      {/* Business Financing Section */}
      <section className="py-12">
        <div className="container-custom">
          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Premium Blue Business Financing</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="card">
                <h3 className="text-xl font-bold mb-4">Blue-Ocean Working Capital</h3>
                <p className="text-gray-600 mb-4">
                  Like the endless flow of blue waters, our working capital solutions provide continuous access 
                  to funds for your day-to-day operations and growth initiatives.
                </p>
                <ul className="mb-6 space-y-2 text-gray-600">
                  <li>• Lightning-fast fund access</li>
                  <li>• Unlimited flexibility</li>
                  <li>• Crystal-clear terms</li>
                </ul>
              </div>

              <div className="card">
                <h3 className="text-xl font-bold mb-4">Blue-Sky Business Expansion</h3>
                <p className="text-gray-600 mb-4">
                  Reach for the blue sky with expansion financing that soars above traditional limits. 
                  Open new horizons for your business growth.
                </p>
                <ul className="mb-6 space-y-2 text-gray-600">
                  <li>• Sky-high funding potential</li>
                  <li>• Blue-ribbon service</li>
                  <li>• Premium funding amounts</li>
                </ul>
              </div>

              <div className="card">
                <h3 className="text-xl font-bold mb-4">Debt Consolidation</h3>
                <p className="text-gray-600 mb-4">
                  Consolidate multiple debts into a single payment, often with better terms and 
                  lower overall monthly payments.
                </p>
                <ul className="mb-6 space-y-2 text-gray-600">
                  <li>• Simplified finances</li>
                  <li>• Potentially lower rates</li>
                  <li>• Single monthly payment</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Business Financing Requirements */}
          <div className="bg-gray-50 p-8 rounded-lg">
            <h3 className="text-xl font-bold mb-4">General Requirements</h3>
            <ul className="space-y-2 text-gray-600 mb-6">
              <li>• 6+ months in business</li>
              <li>• $10,000+ in monthly revenue</li>
              <li>• 550+ credit score (for principal business owner)</li>
              <li>• Basic business documentation</li>
            </ul>
            <p className="text-gray-600">
              Specific requirements may vary based on loan type and amount. 
              Contact us for a personalized assessment.
            </p>
          </div>
        </div>
      </section>

      {/* Equipment Financing Section */}
      <section className="py-12 bg-gray-50">
        <div className="container-custom">
          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Equipment Financing</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="card">
                <h3 className="text-xl font-bold mb-4">Equipment Loans</h3>
                <p className="text-gray-600 mb-4">
                  Purchase new or used equipment with a loan specifically designed for equipment acquisition.
                  The equipment serves as collateral.
                </p>
                <ul className="mb-6 space-y-2 text-gray-600">
                  <li>• Ownership of equipment</li>
                  <li>• Fixed monthly payments</li>
                  <li>• Potential tax benefits</li>
                  <li>• Terms up to 7 years</li>
                </ul>
              </div>

              <div className="card">
                <h3 className="text-xl font-bold mb-4">Equipment Leasing</h3>
                <p className="text-gray-600 mb-4">
                  Use equipment without purchasing it outright. At the end of the lease, you can
                  purchase the equipment, renew the lease, or upgrade to newer equipment.
                </p>
                <ul className="mb-6 space-y-2 text-gray-600">
                  <li>• Lower upfront costs</li>
                  <li>• Equipment upgrade options</li>
                  <li>• Potential off-balance sheet financing</li>
                  <li>• Flexible end-of-term options</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Types of Equipment */}
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <h3 className="text-xl font-bold mb-4">Equipment We Finance</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <ul className="space-y-2 text-gray-600">
                <li>• Construction equipment</li>
                <li>• Manufacturing machinery</li>
                <li>• Medical equipment</li>
                <li>• Restaurant equipment</li>
              </ul>
              <ul className="space-y-2 text-gray-600">
                <li>• Vehicles and trucks</li>
                <li>• IT hardware and software</li>
                <li>• Office furniture</li>
                <li>• Agriculture equipment</li>
              </ul>
              <ul className="space-y-2 text-gray-600">
                <li>• Fitness equipment</li>
                <li>• HVAC systems</li>
                <li>• Printing equipment</li>
                <li>• And much more...</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12">
        <div className="container-custom">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="card">
              <h3 className="text-xl font-bold mb-2">How long does the application process take?</h3>
              <p className="text-gray-600">
                Our application process is streamlined for efficiency. Most applications are processed within 24-48 hours,
                with funding available as quickly as same-day approval for qualified applicants.
              </p>
            </div>
            
            <div className="card">
              <h3 className="text-xl font-bold mb-2">What documents will I need to apply?</h3>
              <p className="text-gray-600">
                Typically, you'll need business bank statements from the last 3-6 months, basic business information,
                a valid ID, and equipment quotes (for equipment financing). Additional documents may be required based on
                loan type and amount.
              </p>
            </div>
            
            <div className="card">
              <h3 className="text-xl font-bold mb-2">Are there any prepayment penalties?</h3>
              <p className="text-gray-600">
                This depends on the specific loan product. Some of our financing options offer prepayment without penalty,
                while others may have a predetermined fee structure. We'll clearly outline any potential fees before you
                accept financing.
              </p>
            </div>
            
            <div className="card">
              <h3 className="text-xl font-bold mb-2">What if I have less-than-perfect credit?</h3>
              <p className="text-gray-600">
                We consider multiple factors beyond just credit scores. Strong revenue, time in business, and overall
                business health can compensate for lower credit scores in many cases.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-primary text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Ready to Get Started?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Apply now or contact us to discuss your specific financing needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/application" className="btn-outline text-white border-white text-lg px-8 py-3">
              Start Application
            </Link>
            <Link href="/contact" className="btn-outline text-white border-white text-lg px-8 py-3">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
