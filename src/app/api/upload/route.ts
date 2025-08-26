import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File
    const settings = JSON.parse(data.get('settings') as string)

    if (!file) {
      return NextResponse.json({ error: 'No file received' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const timestamp = Date.now()
    const fileName = `${timestamp}_${file.name}`
    const uploadPath = join(process.cwd(), 'public/uploads', fileName)

    await writeFile(uploadPath, buffer)

    const printJob = await prisma.printJob.create({
      data: {
        userId: session.user.id,
        fileName,
        originalName: file.name,
        filePath: uploadPath,
        fileSize: file.size,
        fileType: file.type,
        copies: settings.copies,
        isDraft: settings.isDraft,
        isColor: settings.isColor,
        orientation: settings.orientation,
        pages: settings.pages === 'all' ? null : settings.pages,
        printerName: settings.printerId,
        status: 'pending',
      },
    })

    return NextResponse.json({ 
      success: true, 
      jobId: printJob.id,
      fileName 
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}