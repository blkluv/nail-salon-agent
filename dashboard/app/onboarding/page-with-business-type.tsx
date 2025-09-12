'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import PlanSelector, { PlanTier } from '../../components/PlanSelector'
import RapidSetupSuccess from '../../components/RapidSetupSuccess'
import MayaJobSelector, { MayaJob } from '../../components/MayaJobSelector'
import BusinessTypeSelector from '../../components/BusinessTypeSelector'
import { FEATURE_FLAGS, type BusinessType, getMayaJobForBusinessType } from '../../lib/feature-flags'

interface BusinessInfo {
  name: string
  email: string
  phone: string
  businessType: string
  mayaJobId?: string
  ownerFirstName?: string
  ownerLastName?: string
}

interface RapidSetupFormProps {
  selectedPlan: PlanTier
  paymentMethodId: string
  selectedJob: MayaJob | null
  businessType: BusinessType
  onFormSubmit: (businessInfo: BusinessInfo) => Promise<void>
  loading: boolean
}

function RapidSetupForm({ selectedPlan, paymentMethodId, selectedJob, businessType, onFormSubmit, loading }: RapidSetupFormProps) {
  const [formData, setFormData] = useState<BusinessInfo>({
    name: '',
    email: '',
    phone: '',
    businessType: businessType,
    mayaJobId: selectedJob?.id || getMayaJobForBusinessType(businessType)
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
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setSubmitting(true)
    try {
      await onFormSubmit(formData)
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name as keyof BusinessInfo]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Almost Ready!</h2>
        <p className="text-gray-600">Just a few details and Maya will be answering your calls</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Business Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full p-4 border rounded-lg text-lg ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            placeholder="Enter your business name"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full p-4 border rounded-lg text-lg ${
              errors.email ? 'border-red-300' : 'border-gray-300'
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            placeholder="your@email.com"
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`w-full p-4 border rounded-lg text-lg ${
              errors.phone ? 'border-red-300' : 'border-gray-300'
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            placeholder="+1 (555) 123-4567"
          />
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
        </div>

        {/* Business Type Display */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">Maya Configuration</h3>
          <p className="text-sm text-gray-600">
            Business Type: <span className="font-medium">{getBusinessTypeDisplayName(businessType)}</span>
          </p>
          <p className="text-sm text-gray-600">
            Maya Role: <span className="font-medium">{selectedJob?.title || 'Professional Receptionist'}</span>
          </p>
        </div>

        {/* What happens next */}
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-3">
            ⚡ What happens when you click "Create My AI Assistant"?
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>📞 Provision your dedicated AI phone number</li>
            <li>🤖 Create and configure your Maya assistant</li>
            <li>🎯 Customize Maya for your {getBusinessTypeDisplayName(businessType).toLowerCase()}</li>
            <li>📱 Set up your dashboard with relevant features</li>
          </ul>
          <p className="text-blue-600 font-medium mt-2">
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

type OnboardingStep = 'business-type' | 'job-selection' | 'plan-selection' | 'business-info' | 'success'

interface SetupResult {
  businessName: string
  newPhoneNumber: string | undefined
  existingPhoneNumber: string | undefined
  businessId: string
}

export default function OnboardingPage() {
  const router = useRouter()
  
  // Determine starting step based on feature flags
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(
    FEATURE_FLAGS.businessTypeSelector ? 'business-type' : 'job-selection'
  )
  
  const [businessType, setBusinessType] = useState<BusinessType>('beauty_salon')
  const [selectedJob, setSelectedJob] = useState<MayaJob | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<PlanTier>('professional')
  const [paymentMethodId, setPaymentMethodId] = useState<string>('')
  const [setupResult, setSetupResult] = useState<SetupResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleBusinessTypeSelection = (type: BusinessType, mayaJob: string) => {
    setBusinessType(type)
    
    // If using new business type selector, auto-create job selection
    if (FEATURE_FLAGS.businessTypeSelector) {
      const autoJob: MayaJob = {
        id: mayaJob,
        title: getJobDisplayName(mayaJob),
        icon: '💼',
        description: `Professional ${getBusinessTypeDisplayName(type)} assistant`,
        businessTypes: [type],
        pricing: 'professional',
        features: []
      }
      setSelectedJob(autoJob)
      setCurrentStep('plan-selection')
    } else {
      setCurrentStep('job-selection')
    }
  }

  const handleJobSelection = (job: MayaJob) => {
    setSelectedJob(job)
    setCurrentStep('plan-selection')
  }

  const handlePlanSelection = async (plan: PlanTier, paymentId: string) => {
    setSelectedPlan(plan)
    setPaymentMethodId(paymentId)
    setCurrentStep('business-info')
  }

  const handleBusinessInfoSubmit = async (businessInfo: BusinessInfo) => {
    setLoading(true)
    setError(null)

    try {
      // Enhanced business info with business type
      const enhancedBusinessInfo = {
        ...businessInfo,
        businessType: businessType,
        mayaJobId: selectedJob?.id || getMayaJobForBusinessType(businessType)
      }

      // Call our enhanced provisioning API
      const response = await fetch('/api/admin/provision-client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessInfo: enhancedBusinessInfo,
          selectedPlan,
          paymentMethodId,
          rapidSetup: true // Flag for new rapid setup flow
        })
      })

      if (!response.ok) {
        const errorData = await response.text()
        
        // Try to parse as JSON for structured error handling
        try {
          const errorJson = JSON.parse(errorData)
          
          if (errorJson.errorType === 'duplicate_email') {
            throw new Error(`Account Already Exists: ${errorJson.details}`)
          } else if (errorJson.errorType === 'duplicate_slug') {
            throw new Error(`Business Name Conflict: ${errorJson.details}`)
          } else {
            throw new Error(`Setup Failed: ${errorJson.error || errorJson.details || 'Unknown error'}`)
          }
        } catch (parseError) {
          // If not JSON, use raw error text
          throw new Error(`Setup failed: ${errorData}`)
        }
      }

      const result = await response.json()
      console.log('Rapid setup success:', result)
      
      setSetupResult({
        businessName: businessInfo.name,
        newPhoneNumber: result.newPhoneNumber,
        existingPhoneNumber: result.existingPhoneNumber,
        businessId: result.businessId
      })
      
      setCurrentStep('success')
    } catch (err) {
      console.error('Setup error:', err)
      setError(err instanceof Error ? err.message : 'Setup failed')
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Setup Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => {
              setError(null)
              setCurrentStep(FEATURE_FLAGS.businessTypeSelector ? 'business-type' : 'job-selection')
            }}
            className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      {currentStep === 'business-type' && FEATURE_FLAGS.businessTypeSelector && (
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <BusinessTypeSelector
            onBusinessTypeSelect={handleBusinessTypeSelection}
            selectedType={businessType}
          />
          <div className="text-center mt-8">
            <button
              onClick={() => handleBusinessTypeSelection(businessType, getMayaJobForBusinessType(businessType))}
              className="bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 font-semibold"
            >
              Continue with {getBusinessTypeDisplayName(businessType)}
            </button>
          </div>
        </div>
      )}

      {currentStep === 'job-selection' && !FEATURE_FLAGS.businessTypeSelector && (
        <MayaJobSelector onJobSelect={handleJobSelection} />
      )}

      {currentStep === 'plan-selection' && (
        <PlanSelector
          onPlanSelected={handlePlanSelection}
        />
      )}

      {currentStep === 'business-info' && (
        <RapidSetupForm
          selectedPlan={selectedPlan}
          paymentMethodId={paymentMethodId}
          selectedJob={selectedJob}
          businessType={businessType}
          onFormSubmit={handleBusinessInfoSubmit}
          loading={loading}
        />
      )}

      {currentStep === 'success' && setupResult && (
        <RapidSetupSuccess
          businessName={setupResult.businessName}
          newPhoneNumber={setupResult.newPhoneNumber}
          existingPhoneNumber={setupResult.existingPhoneNumber}
          selectedPlan={selectedPlan || 'starter'}
          onContinueToDashboard={() => window.location.href = '/dashboard'}
        />
      )}
    </div>
  )
}

// Helper functions
function getBusinessTypeDisplayName(type: BusinessType): string {
  switch (type) {
    case 'beauty_salon':
      return 'Beauty & Wellness'
    case 'general_business':
      return 'Professional Services'
    case 'home_services':
      return 'Home Services'
    case 'medical_practice':
      return 'Medical Practice'
    case 'dental_practice':
      return 'Dental Practice'
    default:
      return 'Business'
  }
}

function getJobDisplayName(jobId: string): string {
  switch (jobId) {
    case 'nail-salon-receptionist':
      return 'Maya - Beauty Specialist'
    case 'general-receptionist':
      return 'Maya - Professional Receptionist'
    case 'medical-scheduler':
      return 'Maya - Medical Scheduler'
    default:
      return 'Maya - AI Assistant'
  }
}