import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | Hello Blue Lenders',
  description: 'Connect with Hello Blue Lenders for premium business financing solutions. Our blue-class team is ready to help you navigate your funding journey.',
};

export default function Contact() {
  return (
    <>
      <section className="bg-gray-50 page-header-section">
        <div className="container-custom">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Contact Hello Blue Lenders</h1>
          <p className="text-gray-600 mb-0">
            We're here to provide blue-class service for all your premium financing needs
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
              <form className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="form-input"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-input"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="form-input"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    className="form-input"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    className="form-input"
                    required
                  ></textarea>
                </div>

                <div>
                  <button type="submit" className="btn-primary w-full">
                    Send Message
                  </button>
                </div>
              </form>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
              <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Address</h3>
                  <p className="text-gray-600">123 Blue Avenue</p>
                  <p className="text-gray-600">New York, NY 10001</p>
                </div>

                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Phone</h3>
                  <p className="text-gray-600">(555) 123-BLUE</p>
                </div>

                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Email</h3>
                  <p className="text-gray-600">info@hellobluelenders.com</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Business Hours</h3>
                  <p className="text-gray-600">Monday - Friday: 9:00 AM - 5:00 PM</p>
                  <p className="text-gray-600">Saturday - Sunday: Closed</p>
                </div>
              </div>

              <div className="bg-primary text-white p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4 text-white">How Our Blue Team Can Help</h3>
                <ul className="space-y-2">
                  <li>• Premium business financing applications</li>
                  <li>• Blue-chip equipment loan inquiries</li>
                  <li>• Blue-ribbon customer support</li>
                  <li>• Strategic partnership opportunities</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
