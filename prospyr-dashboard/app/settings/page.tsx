'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { ComingSoon } from '@/components/EmptyState'
import { Settings } from 'lucide-react'

export default function SettingsPage() {
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
          <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>
          <ComingSoon
            icon={Settings}
            title="Settings Coming Soon"
            description="Configure Paperclip connection, manage agent defaults, set notification preferences, and customize your control center experience."
          />
        </div>
      </main>
    </div>
  )
}
