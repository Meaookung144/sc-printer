import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import DashboardClient from '@/components/dashboard-client'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  const printJobs = await prisma.printJob.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 50,
  })

  const printers = await prisma.printer.findMany({
    orderBy: {
      name: 'asc',
    },
  })

  return (
    <DashboardClient 
      user={session.user} 
      printJobs={printJobs}
      printers={printers}
    />
  )
}