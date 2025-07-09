'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function SetupPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [adminData, setAdminData] = useState<any>(null);
  const [tempPassword, setTempPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
      validateToken(tokenParam);
    } else {
      setError('Invalid setup link. No token provided.');
      setLoading(false);
    }
  }, [searchParams]);

  const validateToken = async (tokenValue: string) => {
    try {
      const response = await fetch(`/api/admin/temp-password?token=${tokenValue}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setAdminData(data);
      } else {
        setError(data.error || 'Invalid or expired setup link.');
      }
    } catch (err) {
      setError('Failed to validate setup link.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tempPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch('/api/admin/temp-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          tempPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/admin/login');
        }, 3000);
      } else {
        setError(data.error || 'Failed to setup password.');
      }
    } catch (err) {
      setError('An error occurred while setting up your password.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Validating setup link...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !adminData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Setup Link</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/admin/login')}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-center">
            <div className="text-green-500 text-5xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Account Setup Complete!</h1>
            <p className="text-gray-600 mb-6">
              Your admin account has been successfully created. You will be redirected to the login page in a few seconds.
            </p>
            <button
              onClick={() => router.push('/admin/login')}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
            >
              Login Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Account Setup</h1>
          <p className="text-gray-600">Welcome to Blue Lender Admin Portal</p>
        </div>

        {adminData && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Account Details:</h3>
            <p className="text-sm text-gray-600">Email: {adminData.email}</p>
            {adminData.username && <p className="text-sm text-gray-600">Username: {adminData.username}</p>}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="tempPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Temporary Password
            </label>
            <input
              type="password"
              id="tempPassword"
              value={tempPassword}
              onChange={(e) => setTempPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter the temporary password from your email"
              required
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Create a new password (min. 8 characters)"
              required
              minLength={8}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Confirm your new password"
              required
              minLength={8}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary text-white py-3 px-4 rounded-lg hover:bg-primary-dark focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Setting up account...' : 'Complete Setup'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Need help? Contact your system administrator.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SetupPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <SetupPasswordForm />
    </Suspense>
  );
}
