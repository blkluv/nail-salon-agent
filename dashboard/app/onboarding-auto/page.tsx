'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  BuildingStorefrontIcon,
  PhoneIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  ArrowRightIcon,
  SparklesIcon,
  ClockIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

interface OnboardingForm {
  // Business Details
  businessName: string
  businessType: 'nail_salon' | 'spa' | 'beauty_salon' | 'barbershop'
  
  // Owner Details
  ownerName: string
  ownerEmail: string
  ownerPhone: string
  
  // Business Location
  address: string
  city: string
  state: string
  zipCode: string
  
  // Plan Selection
  plan: 'starter' | 'professional' | 'business' | 'enterprise'
  
  // Optional Services
  customServices: string[]
  
  // Marketing
  howDidYouHear: string
  marketingOptIn: boolean
}

const BUSINESS_TYPES = [
  { value: 'nail_salon', label: '💅 Nail Salon', icon: '💅' },
  { value: 'spa', label: '🧘 Spa & Wellness', icon: '🧘' },
  { value: 'beauty_salon', label: '💄 Beauty Salon', icon: '💄' },
  { value: 'barbershop', label: '✂️ Barbershop', icon: '✂️' }
]

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 47,
    description: 'Perfect for single-location salons starting with AI',
    features: [
      '✅ 24/7 AI phone assistant',
      '✅ Basic appointment booking',
      '✅ Customer management',
      '✅ Real-time analytics',
      '❌ Payment processing',
      '❌ Loyalty program'
    ],
    popular: false
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 97,
    description: 'Most popular - Complete business automation',
    features: [
      '✅ Everything in Starter',
      '✅ Payment processing (Square/Stripe)',
      '✅ Loyalty program',
      '✅ Advanced analytics',
      '✅ Email marketing',
      '❌ Multi-location'
    ],
    popular: true
  },
  {
    id: 'business',
    name: 'Business',
    price: 197,
    description: 'Scale across multiple locations',
    features: [
      '✅ Everything in Professional',
      '✅ Multi-location management (up to 3)',
      '✅ Team management',
      '✅ Advanced reporting',
      '✅ Custom branding',
      '❌ White-label solutions'
    ],
    popular: false
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 397,
    description: 'Unlimited scaling with white-label options',
    features: [
      '✅ Everything in Business',
      '✅ Unlimited locations',
      '✅ White-label solutions',
      '✅ API access',
      '✅ Custom integrations',
      '✅ Dedicated support'
    ],
    popular: false
  }
]

export default function AutomatedOnboarding() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [setupResult, setSetupResult] = useState<any>(null)

  const [formData, setFormData] = useState<OnboardingForm>({
    businessName: '',
    businessType: 'nail_salon',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    plan: 'professional',
    customServices: [],
    howDidYouHear: '',
    marketingOptIn: true
  })

  const updateFormData = (updates: Partial<OnboardingForm>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      console.log('🚀 Submitting automated onboarding...')
      
      const response = await fetch('/api/onboard/mock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessName: formData.businessName,
          businessType: formData.businessType,
          ownerName: formData.ownerName,
          ownerEmail: formData.ownerEmail,
          ownerPhone: formData.ownerPhone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          plan: formData.plan,
          services: formData.customServices.length > 0 ? formData.customServices : undefined,
          howDidYouHear: formData.howDidYouHear,
          marketingOptIn: formData.marketingOptIn
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Setup failed')
      }

      console.log('✅ Onboarding completed:', result)
      setSetupResult(result)
      setIsComplete(true)

    } catch (error) {
      console.error('❌ Onboarding failed:', error)
      alert(`Setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.businessName && formData.businessType && formData.ownerName
      case 2:
        return formData.ownerEmail && formData.ownerPhone
      case 3:
        return true // Plan selection is always valid
      case 4:
        return true // Review is always valid
      default:
        return true
    }
  }

  if (isComplete && setupResult) {
    return (
      <div className=\"min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4\">
        <div className=\"max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 text-center\">
          <div className=\"mb-8\">
            <CheckCircleIcon className=\"h-16 w-16 text-green-500 mx-auto mb-4\" />
            <h1 className=\"text-3xl font-bold text-gray-900 mb-2\">
              🎉 Welcome to DropFly AI!
            </h1>
            <p className=\"text-gray-600 text-lg\">
              {formData.businessName} is now powered by AI!
            </p>
          </div>

          <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6 mb-8\">
            <div className=\"bg-green-50 border border-green-200 rounded-lg p-6\">
              <PhoneIcon className=\"h-8 w-8 text-green-600 mx-auto mb-3\" />
              <h3 className=\"font-semibold text-gray-900 mb-2\">AI Assistant Ready</h3>
              <p className=\"text-sm text-gray-600 mb-3\">
                Your 24/7 AI booking assistant is live
              </p>
              <p className=\"font-mono text-lg font-bold text-green-600\">
                {setupResult.data?.phoneNumber}
              </p>
            </div>

            <div className=\"bg-blue-50 border border-blue-200 rounded-lg p-6\">
              <ChartBarIcon className=\"h-8 w-8 text-blue-600 mx-auto mb-3\" />
              <h3 className=\"font-semibold text-gray-900 mb-2\">Dashboard Ready</h3>
              <p className=\"text-sm text-gray-600 mb-3\">
                Manage everything from your admin dashboard
              </p>
              <button
                onClick={() => window.open(setupResult.data?.dashboardUrl, '_blank')}
                className=\"text-blue-600 hover:text-blue-700 font-medium\"
              >
                Open Dashboard →
              </button>
            </div>
          </div>

          <div className=\"bg-gray-50 rounded-lg p-6 mb-8\">
            <h3 className=\"font-semibold text-gray-900 mb-4\">What's Set Up For You:</h3>
            <div className=\"grid grid-cols-2 gap-3 text-sm\">
              {Object.entries(setupResult.data?.setup || {}).map(([key, value]) => (
                <div key={key} className=\"flex items-center\">
                  <span className=\"mr-2\">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className=\"space-y-4\">
            <button
              onClick={() => window.open(setupResult.data?.dashboardUrl, '_blank')}
              className=\"w-full bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors\"
            >
              Go to Dashboard
            </button>
            
            <p className=\"text-sm text-gray-500\">
              Test your AI assistant: Call {setupResult.data?.phoneNumber}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className=\"min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8\">
      <div className=\"max-w-4xl mx-auto px-4\">
        {/* Header */}
        <div className=\"text-center mb-12\">
          <div className=\"flex items-center justify-center mb-4\">
            <SparklesIcon className=\"h-10 w-10 text-purple-600 mr-3\" />
            <h1 className=\"text-3xl font-bold text-gray-900\">
              Launch Your AI-Powered Salon
            </h1>
          </div>
          <p className=\"text-gray-600 text-lg\">
            Get your 24/7 AI booking assistant set up in under 5 minutes
          </p>
          
          {/* Progress Bar */}
          <div className=\"flex items-center justify-center mt-8\">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className=\"flex items-center\">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-12 h-1 mx-2 ${
                    step < currentStep ? 'bg-purple-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className=\"bg-white rounded-2xl shadow-xl p-8\">
          {/* Step 1: Business Info */}
          {currentStep === 1 && (
            <div>
              <h2 className=\"text-2xl font-bold text-gray-900 mb-6\">Tell us about your business</h2>
              
              <div className=\"space-y-6\">
                <div>
                  <label className=\"block text-sm font-medium text-gray-700 mb-2\">
                    Business Name *
                  </label>
                  <input
                    type=\"text\"
                    value={formData.businessName}
                    onChange={(e) => updateFormData({ businessName: e.target.value })}
                    className=\"w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500\"
                    placeholder=\"Glamour Nails Studio\"
                  />
                </div>

                <div>
                  <label className=\"block text-sm font-medium text-gray-700 mb-2\">
                    Business Type *
                  </label>
                  <div className=\"grid grid-cols-2 gap-4\">
                    {BUSINESS_TYPES.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => updateFormData({ businessType: type.value as any })}
                        className={`p-4 border-2 rounded-lg text-left transition-colors ${
                          formData.businessType === type.value
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className=\"text-2xl mb-2\">{type.icon}</div>
                        <div className=\"font-medium text-gray-900\">{type.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className=\"block text-sm font-medium text-gray-700 mb-2\">
                    Owner Name *
                  </label>
                  <input
                    type=\"text\"
                    value={formData.ownerName}
                    onChange={(e) => updateFormData({ ownerName: e.target.value })}
                    className=\"w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500\"
                    placeholder=\"Sarah Johnson\"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Contact Info */}
          {currentStep === 2 && (
            <div>
              <h2 className=\"text-2xl font-bold text-gray-900 mb-6\">Contact Information</h2>
              
              <div className=\"space-y-6\">
                <div>
                  <label className=\"block text-sm font-medium text-gray-700 mb-2\">
                    Email Address *
                  </label>
                  <input
                    type=\"email\"
                    value={formData.ownerEmail}
                    onChange={(e) => updateFormData({ ownerEmail: e.target.value })}
                    className=\"w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500\"
                    placeholder=\"sarah@glamournails.com\"
                  />
                </div>

                <div>
                  <label className=\"block text-sm font-medium text-gray-700 mb-2\">
                    Phone Number *
                  </label>
                  <input
                    type=\"tel\"
                    value={formData.ownerPhone}
                    onChange={(e) => updateFormData({ ownerPhone: e.target.value })}
                    className=\"w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500\"
                    placeholder=\"(555) 123-4567\"
                  />
                </div>

                <div className=\"grid grid-cols-2 gap-4\">
                  <div>
                    <label className=\"block text-sm font-medium text-gray-700 mb-2\">
                      Address
                    </label>
                    <input
                      type=\"text\"
                      value={formData.address}
                      onChange={(e) => updateFormData({ address: e.target.value })}
                      className=\"w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500\"
                      placeholder=\"123 Main Street\"
                    />
                  </div>
                  <div>
                    <label className=\"block text-sm font-medium text-gray-700 mb-2\">
                      City
                    </label>
                    <input
                      type=\"text\"
                      value={formData.city}
                      onChange={(e) => updateFormData({ city: e.target.value })}
                      className=\"w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500\"
                      placeholder=\"New York\"
                    />
                  </div>
                </div>

                <div className=\"grid grid-cols-2 gap-4\">
                  <div>
                    <label className=\"block text-sm font-medium text-gray-700 mb-2\">
                      State
                    </label>
                    <input
                      type=\"text\"
                      value={formData.state}
                      onChange={(e) => updateFormData({ state: e.target.value })}
                      className=\"w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500\"
                      placeholder=\"NY\"
                    />
                  </div>
                  <div>
                    <label className=\"block text-sm font-medium text-gray-700 mb-2\">
                      ZIP Code
                    </label>
                    <input
                      type=\"text\"
                      value={formData.zipCode}
                      onChange={(e) => updateFormData({ zipCode: e.target.value })}
                      className=\"w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500\"
                      placeholder=\"10001\"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Plan Selection */}
          {currentStep === 3 && (
            <div>
              <h2 className=\"text-2xl font-bold text-gray-900 mb-6\">Choose Your Plan</h2>
              
              <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6\">
                {PLANS.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all ${
                      formData.plan === plan.id
                        ? 'border-purple-500 bg-purple-50 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${plan.popular ? 'ring-2 ring-purple-200' : ''}`}
                    onClick={() => updateFormData({ plan: plan.id as any })}
                  >
                    {plan.popular && (
                      <div className=\"absolute -top-3 left-1/2 transform -translate-x-1/2\">
                        <span className=\"bg-purple-600 text-white text-xs px-3 py-1 rounded-full font-medium\">
                          Most Popular
                        </span>
                      </div>
                    )}
                    
                    <div className=\"text-center mb-4\">
                      <h3 className=\"text-xl font-bold text-gray-900\">{plan.name}</h3>
                      <div className=\"flex items-center justify-center mt-2\">
                        <span className=\"text-3xl font-bold text-gray-900\">${plan.price}</span>
                        <span className=\"text-gray-600 ml-1\">/month</span>
                      </div>
                      <p className=\"text-sm text-gray-600 mt-2\">{plan.description}</p>
                    </div>
                    
                    <ul className=\"space-y-2\">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className=\"text-sm flex items-start\">
                          <span className=\"mr-2 text-xs\">{feature.split(' ')[0]}</span>
                          <span className={feature.startsWith('✅') ? 'text-gray-700' : 'text-gray-400'}>
                            {feature.substring(2)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Review & Launch */}
          {currentStep === 4 && (
            <div>
              <h2 className=\"text-2xl font-bold text-gray-900 mb-6\">Ready to Launch! 🚀</h2>
              
              <div className=\"bg-gray-50 rounded-lg p-6 mb-6\">
                <h3 className=\"font-semibold text-gray-900 mb-4\">Your Setup Summary:</h3>
                <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4 text-sm\">
                  <div>
                    <strong>Business:</strong> {formData.businessName}
                  </div>
                  <div>
                    <strong>Owner:</strong> {formData.ownerName}
                  </div>
                  <div>
                    <strong>Email:</strong> {formData.ownerEmail}
                  </div>
                  <div>
                    <strong>Plan:</strong> {PLANS.find(p => p.id === formData.plan)?.name} (${PLANS.find(p => p.id === formData.plan)?.price}/month)
                  </div>
                </div>
              </div>

              <div className=\"bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6\">
                <h3 className=\"font-semibold text-blue-900 mb-3\">What happens next:</h3>
                <ul className=\"space-y-2 text-sm text-blue-800\">
                  <li className=\"flex items-center\">
                    <CheckCircleIcon className=\"h-4 w-4 text-blue-600 mr-2\" />
                    AI phone assistant will be created and activated
                  </li>
                  <li className=\"flex items-center\">
                    <CheckCircleIcon className=\"h-4 w-4 text-blue-600 mr-2\" />
                    Management dashboard will be set up
                  </li>
                  <li className=\"flex items-center\">
                    <CheckCircleIcon className=\"h-4 w-4 text-blue-600 mr-2\" />
                    Welcome email with login details will be sent
                  </li>
                  <li className=\"flex items-center\">
                    <CheckCircleIcon className=\"h-4 w-4 text-blue-600 mr-2\" />
                    You'll be ready to accept AI-powered bookings immediately
                  </li>
                </ul>
              </div>

              <div className=\"flex items-center space-x-4 mb-6\">
                <input
                  type=\"checkbox\"
                  id=\"marketing\"
                  checked={formData.marketingOptIn}
                  onChange={(e) => updateFormData({ marketingOptIn: e.target.checked })}
                  className=\"h-4 w-4 text-purple-600 border-gray-300 rounded\"
                />
                <label htmlFor=\"marketing\" className=\"text-sm text-gray-700\">
                  Yes, send me tips and updates about growing my beauty business
                </label>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className=\"w-full bg-purple-600 text-white px-8 py-4 rounded-lg font-medium text-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed\"
              >
                {isSubmitting ? (
                  <div className=\"flex items-center justify-center\">
                    <ClockIcon className=\"h-5 w-5 mr-2 animate-spin\" />
                    Setting up your AI assistant...
                  </div>
                ) : (
                  <div className=\"flex items-center justify-center\">
                    <SparklesIcon className=\"h-5 w-5 mr-2\" />
                    Launch My AI-Powered Salon!
                  </div>
                )}
              </button>
            </div>
          )}

          {/* Navigation */}
          <div className=\"flex justify-between mt-8\">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className=\"flex items-center px-6 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed\"
            >
              <ArrowLeftIcon className=\"h-4 w-4 mr-2\" />
              Previous
            </button>
            
            {currentStep < 4 && (
              <button
                onClick={nextStep}
                disabled={!isStepValid()}
                className=\"flex items-center px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed\"
              >
                Next
                <ArrowRightIcon className=\"h-4 w-4 ml-2\" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}