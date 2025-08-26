'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { ThemeToggle } from './theme-toggle'
import { PrintUpload } from './print-upload'
import { PrintHistory } from './print-history'

interface User {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}

interface PrintJob {
  id: string
  fileName: string
  originalName: string
  copies: number
  isDraft: boolean
  isColor: boolean
  orientation: string
  pages: string | null
  printerName: string
  status: string
  createdAt: Date
}

interface Printer {
  id: string
  name: string
  isOnline: boolean
  driverName: string | null
}

interface DashboardClientProps {
  user: User
  printJobs: PrintJob[]
  printers: Printer[]
}

export default function DashboardClient({ user, printJobs, printers }: DashboardClientProps) {
  const [showUpload, setShowUpload] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-red-600 dark:text-red-400">
                MWIT Student Committee
              </h1>
              <span className="ml-4 text-gray-500 dark:text-gray-400">Print System</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowUpload(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                Print Document
              </button>
              <ThemeToggle />
              <div className="flex items-center space-x-2">
                {user.image && (
                  <img
                    src={user.image}
                    alt={user.name || ''}
                    className="h-8 w-8 rounded-full"
                  />
                )}
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {user.name}
                </span>
                <button
                  onClick={() => signOut()}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Print History
          </h2>
          <PrintHistory printJobs={printJobs} />
        </div>
      </main>

      {showUpload && (
        <PrintUpload 
          printers={printers}
          onClose={() => setShowUpload(false)}
        />
      )}
    </div>
  )
}