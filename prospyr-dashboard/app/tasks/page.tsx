'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { ComingSoon } from '@/components/EmptyState'
import { ClipboardList } from 'lucide-react'

export default function TasksPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  if (status === 'loading' || !session) return null

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main id="main-content" className="flex-1 ml-64 p-6">
        <div className="max-w-7xl mx-auto h-full">
          <h1 className="text-2xl font-bold text-white mb-6">Task Manager</h1>
          <ComingSoon
            icon={ClipboardList}
            title="Task Manager Coming Soon"
            description="Assign, track, and re-assign tasks across all your AI agents. Set priorities, deadlines, and get real-time status updates."
          />
        </div>
      </main>
    </div>
  )
}
