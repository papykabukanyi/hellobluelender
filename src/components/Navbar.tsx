'use client';

import Link from 'next/link';
import { ReactNode, useState } from 'react';

interface NavbarProps {
  transparent?: boolean;
}

export default function Navbar({ transparent = false }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const navClass = transparent 
    ? 'bg-transparent text-white' 
    : 'bg-white text-neutral-900 shadow-md';

  const linkClass = transparent
    ? 'text-white hover:text-primary-light hover:bg-white hover:bg-opacity-10'
    : 'text-neutral-700 hover:text-primary hover:bg-primary-muted';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 px-4 transition-all duration-300 ${navClass}`}>
      <div className="container-custom flex items-center justify-between h-16">
        {/* Logo/Brand */}
        <div className="flex items-center">          
          <Link 
            href="/" 
            className={`text-lg sm:text-xl tracking-wide font-permanentMarker hover:scale-105 transition-transform ${transparent ? 'text-blue-300' : 'text-primary'}`}
          >
            HELLO BLUE LENDERS
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-2 lg:space-x-4">
          <Link 
            href="/" 
            className={`px-3 py-2 rounded-lg text-sm lg:text-base font-medium transition-all duration-200 ${linkClass}`}
          >
            Home
          </Link>
          <Link 
            href="/info" 
            className={`px-3 py-2 rounded-lg text-sm lg:text-base font-medium transition-all duration-200 ${linkClass}`}
          >
            Info
          </Link>
          <Link 
            href="/application" 
            className={`px-3 py-2 rounded-lg text-sm lg:text-base font-medium transition-all duration-200 ${linkClass}`}
          >
            Apply Now
          </Link>
          <Link 
            href="/contact" 
            className={`px-3 py-2 rounded-lg text-sm lg:text-base font-medium transition-all duration-200 ${linkClass}`}
          >
            Contact
          </Link>
        </div>
        
        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`p-2 rounded-lg transition-colors ${linkClass}`}
            aria-label="Toggle mobile menu"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>
      
      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className={`md:hidden border-t ${transparent ? 'border-white border-opacity-20 bg-black bg-opacity-80' : 'border-neutral-200 bg-white'}`}>
          <div className="container-custom py-4 space-y-2">
            <Link 
              href="/" 
              className={`block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${linkClass}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/info" 
              className={`block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${linkClass}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Info
            </Link>
            <Link 
              href="/application" 
              className={`block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${linkClass}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Apply Now
            </Link>
            <Link 
              href="/contact" 
              className={`block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${linkClass}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
