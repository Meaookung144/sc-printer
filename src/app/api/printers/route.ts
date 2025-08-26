import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const pythonResponse = await fetch('http://localhost:8000/printers')
    
    if (!pythonResponse.ok) {
      throw new Error('Python printer service unavailable')
    }
    
    const printers = await pythonResponse.json()
    
    return NextResponse.json(printers)
  } catch (error) {
    console.error('Printers API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch printers' },
      { status: 500 }
    )
  }
}