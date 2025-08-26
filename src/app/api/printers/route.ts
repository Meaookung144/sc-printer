import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // During build time, return mock printers
    if (process.env.NODE_ENV !== 'production' && !process.env.PYTHON_API_URL) {
      return NextResponse.json({
        printers: [
          { id: 'mock-printer', name: 'Mock Printer', isOnline: true, driverName: 'Mock Driver' }
        ]
      })
    }

    const apiUrl = process.env.PYTHON_API_URL || 'http://localhost:8000'
    const pythonResponse = await fetch(`${apiUrl}/printers`, {
      signal: AbortSignal.timeout(5000) // 5 second timeout
    })
    
    if (!pythonResponse.ok) {
      throw new Error('Python printer service unavailable')
    }
    
    const printers = await pythonResponse.json()
    
    return NextResponse.json(printers)
  } catch (error) {
    console.error('Printers API error:', error)
    
    // Return empty printers list instead of error during build
    return NextResponse.json({
      printers: [],
      error: 'Printer service unavailable'
    })
  }
}