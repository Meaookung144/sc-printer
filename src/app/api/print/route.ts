import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { copyFile } from 'fs/promises'
import { join } from 'path'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { fileName, settings } = await request.json()

    const uploadPath = join(process.cwd(), 'public/uploads', fileName)
    const printPath = join(process.cwd(), 'public/print', fileName)

    await copyFile(uploadPath, printPath)

    await prisma.printJob.updateMany({
      where: {
        fileName,
        userId: session.user.id,
      },
      data: {
        status: 'printing',
      },
    })

    const printCommand = {
      fileName,
      filePath: printPath,
      settings,
      userId: session.user.id,
    }

    const pythonResponse = await fetch('http://localhost:8000/print', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(printCommand),
    })

    if (!pythonResponse.ok) {
      await prisma.printJob.updateMany({
        where: {
          fileName,
          userId: session.user.id,
        },
        data: {
          status: 'failed',
        },
      })
      throw new Error('Python print service failed')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Print error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}