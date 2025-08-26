'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'AccessDenied':
        return 'Access denied. Only @mwit.ac.th email addresses are allowed.'
      case 'Configuration':
        return 'Server configuration error. Please contact administrator.'
      case 'Verification':
        return 'Email verification failed. Please try again.'
      default:
        return 'An authentication error occurred. Please try again.'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            Authentication Error
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {getErrorMessage(error)}
          </p>
        </div>
        <div className="text-center">
          <Link
            href="/login"
            className="inline-block bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            Try Again
          </Link>
        </div>
        {error === 'AccessDenied' && (
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              This system is restricted to MWIT students and staff only.
              <br />
              Please use your @mwit.ac.th email address.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}