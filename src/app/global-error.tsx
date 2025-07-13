'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-red-600 mb-4">Something went wrong!</h1>
            <p className="text-gray-600 mb-8">
              Hello Blue Lenders encountered an unexpected error.
            </p>
            <button
              onClick={() => reset()}
              className="btn-primary inline-block px-6 py-3 text-white rounded-lg hover:scale-105 transition-transform mr-4"
            >
              Try again
            </button>
            <a
              href="/"
              className="btn-outline inline-block px-6 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-all"
            >
              Go home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
