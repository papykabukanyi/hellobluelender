'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-primary mb-4">500</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Server Error</h2>
        <p className="text-gray-600 mb-8">
          Hello Blue Lenders encountered an unexpected error. Our blue team is working to fix this.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="btn-primary px-6 py-3 text-white rounded-lg hover:scale-105 transition-transform"
          >
            Try Again
          </button>
          <a
            href="/"
            className="btn-outline px-6 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-all"
          >
            Return Home
          </a>
        </div>
      </div>
    </div>
  );
}
