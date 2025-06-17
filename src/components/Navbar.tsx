import Link from 'next/link';
import { ReactNode } from 'react';

interface NavbarProps {
  transparent?: boolean;
}

export default function Navbar({ transparent = false }: NavbarProps) {
  const navClass = transparent 
    ? 'bg-transparent text-white' 
    : 'bg-white text-primary shadow-md';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 px-4 transition-all duration-300 ${navClass}`}>
      <div className="container-custom flex items-center justify-between h-16">
        <div className="flex items-center">
          <Link href="/" className="text-xl font-bold">
            Blue Lender
          </Link>
        </div>
        
        <div className="hidden md:flex space-x-8">
          <Link href="/" className="hover:text-white hover:bg-primary px-3 py-2 rounded transition-all">
            Home
          </Link>
          <Link href="/info" className="hover:text-white hover:bg-primary px-3 py-2 rounded transition-all">
            Info
          </Link>
          <Link href="/application" className="hover:text-white hover:bg-primary px-3 py-2 rounded transition-all">
            Apply Now
          </Link>
          <Link href="/contact" className="hover:text-white hover:bg-primary px-3 py-2 rounded transition-all">
            Contact
          </Link>
        </div>
        
        <div className="md:hidden">
          <button className="p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}
