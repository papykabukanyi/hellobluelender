import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Admin Login | Blue Lender',
  description: 'Secure login page for Blue Lender administrators.',
  robots: 'noindex, nofollow',
};

export default function AdminLogin() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary">Blue Lender Admin</h1>
          <p className="text-gray-600">Sign in to access the admin dashboard</p>
        </div>
        
        <form>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="form-input"
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="form-input"
              required
            />
          </div>
          
          <div className="mb-6">
            <Link href="/admin/dashboard" className="btn-primary w-full block text-center">
              Sign In
            </Link>
          </div>
          
          <div className="text-center">
            <Link href="/" className="text-primary text-sm hover:underline">
              Return to Website
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
