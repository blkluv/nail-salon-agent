'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import PlanSelector, { PlanTier } from '../../components/PlanSelector'
import RapidSetupSuccess from '../../components/RapidSetupSuccess'

interface BusinessInfo {
  name: string
  email: string
  phone: string
  businessType: string
  ownerFirstName?: string
  ownerLastName?: string
}

interface RapidSetupFormProps {
  selectedPlan: PlanTier
  paymentMethodId: string
  onFormSubmit: (businessInfo: BusinessInfo) => Promise<void>
  loading: boolean
}

const BUSINESS_TYPES = [
  'Nail Salon',
  'Hair Salon', 
  'Day Spa',
  'Medical Spa',
  'Massage Therapy',
  'Beauty Salon',
  'Barbershop',
  'Esthetics',
  'Wellness Center',
  'Other'
]

function RapidSetupForm({ selectedPlan, paymentMethodId, onFormSubmit, loading }: RapidSetupFormProps) {
  const [formData, setFormData] = useState<BusinessInfo>({
    name: '',
    email: '',
    phone: '',
    businessType: 'Nail Salon'
  })
  const [errors, setErrors] = useState<Partial<BusinessInfo>>({})
  const [submitting, setSubmitting] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: Partial<BusinessInfo> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Business name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    if (!formData.businessType) {
      newErrors.businessType = 'Please select your business type'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setSubmitting(true)
    try {
      await onFormSubmit(formData)
    } catch (error) {
      console.error('Form submission error:', error)
      // Error handling will be managed by parent component
    } finally {
      setSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof BusinessInfo, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const planNames = {
    starter: 'Starter',
    professional: 'Professional', 
    business: 'Business'
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Almost There! Just Your Business Info
        </h2>
        <p className="text-lg text-gray-600 mb-4">
          We'll use this to set up your AI assistant and generate your dedicated phone number
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800">
            <span className="font-semibold">Selected Plan:</span> {planNames[selectedPlan]} 
            <span className="ml-4 text-sm">✅ Payment method secured (no charges during trial)</span>
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Name */}
        <div>
          <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
            Business Name *
          </label>
          <input
            type="text"
            id="businessName"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="e.g., Bella's Nail Studio"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
        </div>

        {/* Business Phone (Current Line) */}
        <div>
          <label htmlFor="businessPhone" className="block text-sm font-medium text-gray-700 mb-2">
            Your Current Business Phone Number *
          </label>
          <input
            type="tel"
            id="businessPhone"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="(555) 123-4567"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
          <p className="text-gray-600 text-sm mt-1">
            📞 Don't worry - we'll keep this number safe and give you a new one for testing
          </p>
        </div>

        {/* Owner Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Owner Email Address *
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="owner@bellasnails.com"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
        </div>

        {/* Business Type */}
        <div>
          <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-2">
            Business Type *
          </label>
          <select
            id="businessType"
            value={formData.businessType}
            onChange={(e) => handleInputChange('businessType', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.businessType ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            {BUSINESS_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.businessType && <p className="text-red-600 text-sm mt-1">{errors.businessType}</p>}
          <p className="text-gray-600 text-sm mt-1">
            🤖 We'll automatically create services and settings based on your business type
          </p>
        </div>

        {/* Auto-Generation Info */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">
            ✨ What happens next? (Automatic setup)
          </h3>
          <ul className="text-green-700 text-sm space-y-1">
            <li>🎯 Generate popular services for your business type</li>
            <li>👤 Create your owner profile automatically</li>
            <li>⏰ Set standard business hours (9 AM - 6 PM, editable later)</li>
            <li>📞 Provision your dedicated AI phone number</li>
            <li>🤖 Create and configure your AI assistant</li>
          </ul>
          <p className="text-green-600 font-medium mt-2">
            Total setup time: Under 30 seconds!
          </p>
        </div>

        {/* Submit Button */}
        <div className="text-center pt-6">
          <button
            type="submit"
            disabled={submitting || loading}
            className="bg-blue-600 text-white py-4 px-8 rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Setting Up Your AI Assistant...
              </>
            ) : (
              <>
                Create My AI Assistant
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>
          <p className="text-sm text-gray-600 mt-3">
            🔒 Secure processing • ⚡ Instant setup • 🛡️ No charges during trial
          </p>
        </div>
      </form>
    </div>
  )
}

type OnboardingStep = 'plan-selection' | 'business-info' | 'success'

interface SetupResult {
  businessName: string
  newPhoneNumber: string
  existingPhoneNumber: string
  businessId: string
}

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('plan-selection')
  const [selectedPlan, setSelectedPlan] = useState<PlanTier>('professional')
  const [paymentMethodId, setPaymentMethodId] = useState<string>('')
  const [setupResult, setSetupResult] = useState<SetupResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePlanSelection = async (plan: PlanTier, paymentId: string) => {
    setSelectedPlan(plan)
    setPaymentMethodId(paymentId)
    setCurrentStep('business-info')
  }

  const handleBusinessInfoSubmit = async (businessInfo: BusinessInfo) => {
    setLoading(true)
    setError(null)

    try {
      // Call our enhanced provisioning API
      const response = await fetch('/api/admin/provision-client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessInfo,
          selectedPlan,
          paymentMethodId,
          rapidSetup: true // Flag for new rapid setup flow
        })
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`Setup failed: ${errorData}`)
      }

      const result = await response.json()
      
      setSetupResult({
        businessName: businessInfo.name,
        newPhoneNumber: result.phoneNumber,
        existingPhoneNumber: businessInfo.phone,
        businessId: result.businessId
      })

      setCurrentStep('success')

    } catch (err) {
      console.error('Business setup error:', err)
      setError(err instanceof Error ? err.message : 'Setup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleContinueToDashboard = () => {
    if (setupResult) {
      // Set authentication for the new business
      localStorage.setItem('authenticated_business_id', setupResult.businessId)
      localStorage.setItem('authenticated_business_name', setupResult.businessName)
      
      // Navigate to dashboard with onboarding tour
      router.push(`/dashboard?onboarding=true&plan=${selectedPlan}`)
    }
  }

  // Error Display Component
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Setup Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setError(null)
                setCurrentStep('plan-selection')
                setLoading(false)
              }}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <p className="text-sm text-gray-500">
              Need help? Contact{' '}
              <a href="mailto:support@vapi-nail-salon.com" className="text-blue-600 underline">
                support@vapi-nail-salon.com
              </a>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Indicator */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">AI Assistant Setup</h1>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${currentStep !== 'plan-selection' ? 'bg-green-500' : 'bg-blue-500'}`} />
                <span className="text-sm text-gray-600">Plan</span>
                <div className={`w-3 h-3 rounded-full ${currentStep === 'success' ? 'bg-green-500' : currentStep === 'business-info' ? 'bg-blue-500' : 'bg-gray-300'}`} />
                <span className="text-sm text-gray-600">Business Info</span>
                <div className={`w-3 h-3 rounded-full ${currentStep === 'success' ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-sm text-gray-600">Ready</span>
              </div>
            </div>
            {currentStep !== 'plan-selection' && currentStep !== 'success' && (
              <button
                onClick={() => setCurrentStep('plan-selection')}
                className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
              >
                ← Back to plans
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {currentStep === 'plan-selection' && (
          <PlanSelector
            onPlanSelected={handlePlanSelection}
            loading={loading}
          />
        )}

        {currentStep === 'business-info' && (
          <RapidSetupForm
            selectedPlan={selectedPlan}
            paymentMethodId={paymentMethodId}
            onFormSubmit={handleBusinessInfoSubmit}
            loading={loading}
          />
        )}

        {currentStep === 'success' && setupResult && (
          <RapidSetupSuccess
            businessName={setupResult.businessName}
            newPhoneNumber={setupResult.newPhoneNumber}
            existingPhoneNumber={setupResult.existingPhoneNumber}
            selectedPlan={selectedPlan}
            onContinueToDashboard={handleContinueToDashboard}
          />
        )}
      </div>
    </div>
  )
}