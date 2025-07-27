'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import AuthForm from '@/components/auth/AuthForm'
import UserProfile from '@/components/auth/UserProfile'

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Supabase Auth Demo
          </h1>
          <p className="mt-2 text-gray-600">
            {user ? 'Welcome back!' : 'Sign in to your account'}
          </p>
        </div>
        
        {user ? <UserProfile /> : <AuthForm />}
      </div>
    </div>
  )
}
