'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  PhoneIcon, 
  KeyIcon, 
  SparklesIcon,
  UserCircleIcon,
  BuildingStorefrontIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { BusinessDiscoveryService, BusinessRelationship } from '../../../lib/business-discovery'

export default function CustomerLogin() {
  const router = useRouter()
  const [loginData, setLoginData] = useState({
    phone: '',
    verificationMethod: 'sms' as 'sms' | 'email'
  })
  const [step, setStep] = useState<'phone' | 'business_selection' | 'verification'>('phone')
  const [verificationCode, setVerificationCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [businesses, setBusinesses] = useState<BusinessRelationship[]>([])
  const [selectedBusiness, setSelectedBusiness] = useState<string>('')

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginData.phone) return

    setIsLoading(true)
    setError('')
    try {
      // Normalize phone for database lookup
      const normalizedPhone = loginData.phone.replace(/\D/g, '')
      
      // Discover businesses for this phone number
      const discoveredBusinesses = await BusinessDiscoveryService.discoverBusinessesForPhone(normalizedPhone)
      
      if (discoveredBusinesses.length === 0) {
        // New customer - show error for now
        setError('No account found. Please contact your salon to register.')
        setIsLoading(false)
        return
      } else if (discoveredBusinesses.length === 1) {
        // Single business - auto-select and proceed
        setSelectedBusiness(discoveredBusinesses[0].business_id)
        setBusinesses(discoveredBusinesses)
        setStep('verification')
      } else {
        // Multiple businesses - let customer choose
        setBusinesses(discoveredBusinesses)
        setStep('business_selection')
      }
    } catch (error) {
      console.error('Failed to discover businesses:', error)
      setError('Unable to process login. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBusinessSelect = (businessId: string) => {
    setSelectedBusiness(businessId)
    setStep('verification')
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!verificationCode) return

    setIsLoading(true)
    try {
      // For demo, any 6-digit code works
      if (verificationCode.length !== 6) {
        setError('Please enter a 6-digit code')
        setIsLoading(false)
        return
      }
      
      // Store customer session with selected business
      const normalizedPhone = loginData.phone.replace(/\D/g, '')
      localStorage.setItem('customer_phone', normalizedPhone)
      localStorage.setItem('customer_business_id', selectedBusiness)
      
      // Find the selected business details
      const selectedBusinessData = businesses.find(b => b.business_id === selectedBusiness)
      if (selectedBusinessData) {
        localStorage.setItem('customer_business_name', selectedBusinessData.business_name)
      }
      
      router.push('/customer/portal')
    } catch (error) {
      console.error('Failed to verify code:', error)
      setError('Invalid verification code. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`
    }
    return value
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full">
              <SparklesIcon className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Access your bookings and account</p>
        </div>

        {step === 'phone' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSendCode} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    value={loginData.phone}
                    onChange={(e) => setLoginData(prev => ({ 
                      ...prev, 
                      phone: formatPhoneNumber(e.target.value)
                    }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="(555) 123-4567"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  We'll send a verification code to this number
                </p>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !loginData.phone}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Sending Code...
                  </div>
                ) : (
                  'Send Verification Code'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Don't have an account? Book an appointment to get started!
              </p>
            </div>
          </div>
        )}

        {step === 'business_selection' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-6">
              <div className="p-3 bg-purple-100 rounded-full inline-flex mb-4">
                <BuildingStorefrontIcon className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Select Your Salon</h2>
              <p className="text-gray-600 text-sm">
                We found {businesses.length} salons associated with your phone number
              </p>
            </div>

            <div className="space-y-3">
              {businesses.map((business) => (
                <button
                  key={business.business_id}
                  onClick={() => handleBusinessSelect(business.business_id)}
                  className="w-full p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 text-left transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h3 className="font-semibold text-gray-900 group-hover:text-purple-700">
                          {business.business_name}
                        </h3>
                        {business.is_preferred && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Preferred
                          </span>
                        )}
                      </div>
                      {business.last_visit_date && (
                        <p className="text-sm text-gray-500 mt-1">
                          Last visit: {new Date(business.last_visit_date).toLocaleDateString()}
                        </p>
                      )}
                      <p className="text-sm text-gray-500">
                        Total visits: {business.total_visits}
                      </p>
                      {business.business_address && (
                        <p className="text-xs text-gray-400 mt-1">
                          {business.business_address}
                        </p>
                      )}
                    </div>
                    <CheckCircleIcon className="w-5 h-5 text-gray-400 group-hover:text-purple-600" />
                  </div>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setStep('phone')
                setBusinesses([])
                setSelectedBusiness('')
                setLoginData({ ...loginData, phone: '' })
              }}
              className="w-full py-2 text-gray-600 hover:text-gray-800 font-medium mt-4"
            >
              ← Use a different phone number
            </button>
          </div>
        )}

        {step === 'verification' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-6">
              <div className="p-3 bg-green-100 rounded-full inline-flex mb-4">
                <KeyIcon className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Check Your Phone</h2>
              <p className="text-gray-600 text-sm">
                We sent a 6-digit code to<br />
                <span className="font-medium">{loginData.phone}</span>
              </p>
            </div>

            {/* Show selected business */}
            {businesses.length > 0 && selectedBusiness && (
              <div className="bg-purple-50 p-4 rounded-lg mb-6">
                <div className="flex items-center">
                  <BuildingStorefrontIcon className="h-5 w-5 text-purple-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-purple-900">
                      Logging into: {businesses.find(b => b.business_id === selectedBusiness)?.business_name}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Demo mode notice */}
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-blue-900">
                <strong>Demo Mode:</strong> Enter any 6-digit code (e.g., 123456)
              </p>
              <p className="text-xs text-blue-700 mt-1">
                In production, a real SMS would be sent to {loginData.phone}
              </p>
            </div>

            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-bold tracking-widest focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || verificationCode.length !== 6}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Verifying...
                  </div>
                ) : (
                  'Verify & Sign In'
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (businesses.length > 1) {
                    setStep('business_selection')
                  } else {
                    setStep('phone')
                    setBusinesses([])
                    setSelectedBusiness('')
                    setLoginData({ ...loginData, phone: '' })
                  }
                  setVerificationCode('')
                  setError('')
                }}
                className="w-full py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                ← {businesses.length > 1 ? 'Choose different salon' : 'Use different phone number'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button className="text-sm text-purple-600 hover:text-purple-700">
                Didn't receive a code? Resend
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-gray-500">
          <p>Secure login powered by NailBooker AI</p>
        </div>
      </div>
    </div>
  )
}