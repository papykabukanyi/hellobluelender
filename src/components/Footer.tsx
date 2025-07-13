import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-primary text-white pt-10 pb-6">
      <div className="container-custom">
        <div className="flex flex-wrap">
          <div className="w-full md:w-1/3 mb-6">            <h3 className="text-xl mb-4 text-white tracking-wide font-permanentMarker" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.3)'}}>HELLO BLUE LENDERS</h3>
            <p className="mb-4 text-white">
              Premium lending solutions with the power of blue. We provide exceptional 
              financing services that help your business thrive and grow.
            </p>
          </div>
          
          <div className="w-full md:w-1/3 mb-6">
            <h4 className="text-lg font-bold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-white hover:text-gray-300">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/info" className="text-white hover:text-gray-300">
                  Info
                </Link>
              </li>
              <li>
                <Link href="/application" className="text-white hover:text-gray-300">
                  Apply Now
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white hover:text-gray-300">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="w-full md:w-1/3 mb-6">
            <h4 className="text-lg font-bold mb-4 text-white">Contact Us</h4>
            <address className="not-italic">
              <p className="mb-2 text-white">123 Blue Avenue</p>
              <p className="mb-2 text-white">New York, NY 10001</p>
              <p className="mb-2 text-white">Phone: (555) 123-BLUE</p>
              <p className="mb-2 text-white">Email: info@hellobluelenders.com</p>
            </address>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 text-center">
          <p className="text-white">&copy; {new Date().getFullYear()} <span className="font-permanentMarker">Hello Blue Lenders</span>. All rights reserved.</p>
          <p className="text-xs text-gray-400 mt-2">Powered By Web Tech Systems</p>
        </div>
      </div>
    </footer>
  );
}
