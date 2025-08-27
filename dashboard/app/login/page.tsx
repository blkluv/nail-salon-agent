'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('🔍 Looking for business with email:', email)
      
      // Find business by owner email
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .select('id, name, email, owner_email, owner_first_name')
        .or(`email.eq.${email},owner_email.eq.${email}`)
        .single()

      if (businessError || !business) {
        console.error('Business not found:', businessError)
        setError('No business found with that email address')
        setLoading(false)
        return
      }

      console.log('✅ Found business:', business.name)
      
      // Store business session in localStorage (simple auth for now)
      localStorage.setItem('authenticated_business_id', business.id)
      localStorage.setItem('authenticated_business_name', business.name)
      localStorage.setItem('authenticated_user_email', email)
      
      // Update the business ID environment variable for this session
      localStorage.setItem('demo_business_id', business.id)
      
      console.log('✅ Authentication successful, redirecting to dashboard')
      router.push('/dashboard')
      
    } catch (err: any) {
      console.error('❌ Login error:', err)
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your nail salon dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your business email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700'
            }`}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Don't have a business account?{' '}
            <a href="/onboarding" className="text-pink-600 hover:text-pink-700 font-medium">
              Get started here
            </a>
          </p>
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 text-center">
            💡 Tip: Use the email address you provided during onboarding
          </p>
        </div>
      </div>
    </div>
  )
}