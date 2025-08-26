'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { VapiPhoneService } from '../../lib/vapi-phone-service'
import { 
  BuildingStorefrontIcon,
  ScissorsIcon,
  UserGroupIcon,
  ClockIcon,
  PhoneIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  ArrowRightIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'

interface BusinessInfo {
  name: string
  email: string
  phone: string
  address: string
  timezone: string
}

interface Service {
  name: string
  duration: number
  price: number
  category: string
}

interface StaffMember {
  first_name: string
  last_name: string
  email: string
  phone: string
  role: string
}

interface BusinessHours {
  [key: number]: {
    is_closed: boolean
    open_time: string
    close_time: string
  }
}

interface PhonePreferences {
  strategy: 'new_number' | 'use_existing'
  existingNumber: string
  forwardingEnabled: boolean
  forwardAfterHours: boolean
  forwardComplexCalls: boolean
  smsEnabled: boolean
  voiceEnabled: boolean
  webEnabled: boolean
  widgetStyle: 'embedded' | 'floating' | 'fullpage'
}

interface PricingPlan {
  id: string
  name: string
  price: number
  channels: ('sms' | 'web' | 'voice')[]
  description: string
  features: string[]
  popular?: boolean
}

interface AddOn {
  id: string
  name: string
  price: number
  description: string
  category: 'ai' | 'communication' | 'business'
}

interface SubscriptionConfig {
  plan: PricingPlan | null
  addOns: AddOn[]
  totalMonthly: number
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'sms-only',
    name: 'SMS Starter',
    price: 39,
    channels: ['sms'],
    description: 'Text message booking and customer communication',
    features: ['Automated SMS booking', 'Appointment reminders', 'Customer management', 'Basic analytics']
  },
  {
    id: 'web-only', 
    name: 'Web Booking',
    price: 49,
    channels: ['web'],
    description: 'Online booking widget for your website',
    features: ['Embedded booking widget', 'Online scheduling', 'Customer portal', 'Basic analytics']
  },
  {
    id: 'voice-only',
    name: 'Voice AI',
    price: 89,
    channels: ['voice'], 
    description: '24/7 AI phone receptionist',
    features: ['AI phone booking', '24/7 availability', 'Natural conversations', 'Advanced analytics']
  },
  {
    id: 'sms-web',
    name: 'SMS + Web Duo',
    price: 79,
    channels: ['sms', 'web'],
    description: 'Text and online booking combined',
    features: ['SMS + Web booking', 'Unified customer data', 'Multi-channel reminders', 'Enhanced analytics'],
    popular: true
  },
  {
    id: 'voice-sms',
    name: 'Voice + SMS Duo', 
    price: 139,
    channels: ['voice', 'sms'],
    description: 'AI phone + text messaging',
    features: ['AI phone + SMS', 'Premium customer service', 'Advanced conversation flows', 'Priority support']
  },
  {
    id: 'voice-web',
    name: 'Voice + Web Duo',
    price: 119,
    channels: ['voice', 'web'], 
    description: 'AI phone + online booking',
    features: ['AI phone + Web widget', 'Omnichannel experience', 'Smart routing', 'Advanced reporting']
  },
  {
    id: 'complete',
    name: 'Complete Suite',
    price: 159,
    channels: ['sms', 'web', 'voice'],
    description: 'Full omnichannel booking experience',
    features: ['All booking channels', 'Unified dashboard', 'Complete customer journey', 'Premium support', 'Custom integrations']
  }
]

const ADD_ONS: AddOn[] = [
  {
    id: 'custom-voice',
    name: 'Custom Voice Agent',
    price: 99,
    description: 'Personalized AI voice and branding for your salon',
    category: 'ai'
  },
  {
    id: 'multi-language',
    name: 'Multi-Language Support',
    price: 39, 
    description: 'Spanish, French, and other language options',
    category: 'communication'
  },
  {
    id: 'advanced-ai',
    name: 'Advanced AI Training',
    price: 49,
    description: 'Salon-specific knowledge and custom responses',
    category: 'ai'
  },
  {
    id: 'loyalty-program',
    name: 'Loyalty Program',
    price: 39,
    description: 'Automated customer rewards and retention',
    category: 'business'
  },
  {
    id: 'payment-processing',
    name: 'Payment Processing',
    price: 39,
    description: 'Integrated payments with Square and Stripe',
    category: 'business'
  },
  {
    id: 'smart-notifications',
    name: 'Smart Notifications',
    price: 19,
    description: 'Advanced staff alerts and customer reminders',
    category: 'communication'
  }
]

const DEFAULT_SERVICES: Service[] = [
  { name: 'Basic Manicure', duration: 30, price: 30, category: 'manicure' },
  { name: 'Gel Manicure', duration: 45, price: 50, category: 'manicure' },
  { name: 'Dip Powder Manicure', duration: 60, price: 55, category: 'manicure' },
  { name: 'Basic Pedicure', duration: 45, price: 40, category: 'pedicure' },
  { name: 'Gel Pedicure', duration: 60, price: 60, category: 'pedicure' },
  { name: 'Spa Pedicure', duration: 75, price: 75, category: 'pedicure' },
  { name: 'Mani-Pedi Combo', duration: 90, price: 85, category: 'combo' },
  { name: 'Nail Art (per nail)', duration: 5, price: 5, category: 'addon' },
  { name: 'French Tips', duration: 15, price: 15, category: 'addon' },
  { name: 'Paraffin Treatment', duration: 15, price: 20, category: 'addon' }
]

const DEFAULT_HOURS: BusinessHours = {
  0: { is_closed: true, open_time: '09:00', close_time: '17:00' }, // Sunday
  1: { is_closed: false, open_time: '09:00', close_time: '19:00' }, // Monday
  2: { is_closed: false, open_time: '09:00', close_time: '19:00' }, // Tuesday
  3: { is_closed: false, open_time: '09:00', close_time: '19:00' }, // Wednesday
  4: { is_closed: false, open_time: '09:00', close_time: '19:00' }, // Thursday
  5: { is_closed: false, open_time: '09:00', close_time: '20:00' }, // Friday
  6: { is_closed: false, open_time: '10:00', close_time: '18:00' }, // Saturday
}

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [assignedPhoneNumber, setAssignedPhoneNumber] = useState<string | null>(null)
  const [business, setBusiness] = useState<any>(null)
  const [subscriptionConfig, setSubscriptionConfig] = useState<SubscriptionConfig>({
    plan: null,
    addOns: [],
    totalMonthly: 0
  })
  
  // Form data
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    name: '',
    email: '',
    phone: '',
    address: '',
    timezone: 'America/New_York'
  })
  
  const [services, setServices] = useState<Service[]>(DEFAULT_SERVICES)
  const [customService, setCustomService] = useState<Service>({
    name: '',
    duration: 30,
    price: 0,
    category: 'custom'
  })
  
  const [staff, setStaff] = useState<StaffMember[]>([
    { first_name: '', last_name: '', email: '', phone: '', role: 'nail_technician' }
  ])
  
  const [businessHours, setBusinessHours] = useState<BusinessHours>(DEFAULT_HOURS)
  
  const [phonePrefs, setPhonePrefs] = useState<PhonePreferences>({
    strategy: 'new_number',
    existingNumber: '',
    forwardingEnabled: true,
    forwardAfterHours: true,
    forwardComplexCalls: true,
    smsEnabled: true,
    voiceEnabled: true,
    webEnabled: true,
    widgetStyle: 'embedded'
  })

  const steps = [
    { id: 1, name: 'Plan Selection', icon: CurrencyDollarIcon },
    { id: 2, name: 'Business Info', icon: BuildingStorefrontIcon },
    { id: 3, name: 'Services', icon: ScissorsIcon },
    { id: 4, name: 'Staff', icon: UserGroupIcon },
    { id: 5, name: 'Hours', icon: ClockIcon },
    { id: 6, name: 'Phone Setup', icon: PhoneIcon },
    { id: 7, name: 'Complete', icon: CheckCircleIcon }
  ]

  const handlePlanSelection = (plan: PricingPlan) => {
    const newConfig = {
      plan,
      addOns: subscriptionConfig.addOns,
      totalMonthly: plan.price + subscriptionConfig.addOns.reduce((sum, addon) => sum + addon.price, 0)
    }
    setSubscriptionConfig(newConfig)
    
    // Update phone preferences based on selected channels
    setPhonePrefs({
      ...phonePrefs,
      smsEnabled: plan.channels.includes('sms'),
      voiceEnabled: plan.channels.includes('voice'),
      webEnabled: plan.channels.includes('web')
    })
    
    setCurrentStep(2)
  }

  const toggleAddOn = (addon: AddOn) => {
    const isSelected = subscriptionConfig.addOns.some(a => a.id === addon.id)
    const newAddOns = isSelected 
      ? subscriptionConfig.addOns.filter(a => a.id !== addon.id)
      : [...subscriptionConfig.addOns, addon]
    
    const newConfig = {
      ...subscriptionConfig,
      addOns: newAddOns,
      totalMonthly: (subscriptionConfig.plan?.price || 0) + newAddOns.reduce((sum, a) => sum + a.price, 0)
    }
    setSubscriptionConfig(newConfig)
  }

  const handleBusinessInfoSubmit = () => {
    if (!businessInfo.name || !businessInfo.email || !businessInfo.phone) {
      setError('Please fill in all required fields')
      return
    }
    setError(null)
    setCurrentStep(3)
  }

  const toggleService = (index: number) => {
    const newServices = [...services]
    const service = newServices[index]
    // Toggle selection by adding/removing a selected property
    if ('selected' in service) {
      delete (service as any).selected
    } else {
      (service as any).selected = true
    }
    setServices(newServices)
  }

  const addCustomService = () => {
    if (!customService.name || customService.price <= 0) {
      setError('Please enter a valid service name and price')
      return
    }
    setServices([...services, { ...customService, selected: true } as any])
    setCustomService({ name: '', duration: 30, price: 0, category: 'custom' })
    setError(null)
  }

  const addStaffMember = () => {
    setStaff([...staff, { first_name: '', last_name: '', email: '', phone: '', role: 'nail_technician' }])
  }

  const updateStaffMember = (index: number, field: keyof StaffMember, value: string) => {
    const newStaff = [...staff]
    newStaff[index][field] = value
    setStaff(newStaff)
  }

  const removeStaffMember = (index: number) => {
    setStaff(staff.filter((_, i) => i !== index))
  }

  const toggleDay = (day: number) => {
    setBusinessHours({
      ...businessHours,
      [day]: {
        ...businessHours[day],
        is_closed: !businessHours[day].is_closed
      }
    })
  }

  const updateHours = (day: number, field: 'open_time' | 'close_time', value: string) => {
    setBusinessHours({
      ...businessHours,
      [day]: {
        ...businessHours[day],
        [field]: value
      }
    })
  }

  const completeOnboarding = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // 1. Create the business
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .insert({
          name: businessInfo.name,
          email: businessInfo.email,
          phone: businessInfo.phone,
          address: businessInfo.address,
          timezone: businessInfo.timezone,
          settings: {
            currency: 'USD',
            booking_buffer_minutes: 15,
            cancellation_window_hours: 24
          }
        })
        .select()
        .single()

      if (businessError) throw businessError
      
      // Store the created business in state
      setBusiness(business)

      // 2. Add selected services
      const selectedServices = services.filter((s: any) => s.selected)
      if (selectedServices.length > 0) {
        const { error: servicesError } = await supabase
          .from('services')
          .insert(
            selectedServices.map(service => ({
              business_id: business.id,
              name: service.name,
              category: service.category,
              duration_minutes: service.duration,
              price: service.price,
              is_active: true
            }))
          )
        
        if (servicesError) throw servicesError
      }

      // 3. Add staff members
      const validStaff = staff.filter(s => s.first_name && s.last_name)
      if (validStaff.length > 0) {
        const { error: staffError } = await supabase
          .from('staff')
          .insert(
            validStaff.map(member => ({
              business_id: business.id,
              first_name: member.first_name,
              last_name: member.last_name,
              email: member.email,
              phone: member.phone,
              role: member.role,
              is_active: true
            }))
          )
        
        if (staffError) throw staffError
      }

      // 4. Add business hours
      const { error: hoursError } = await supabase
        .from('business_hours')
        .insert(
          Object.entries(businessHours).map(([day, hours]) => ({
            business_id: business.id,
            day_of_week: parseInt(day),
            is_closed: hours.is_closed,
            open_time: hours.open_time,
            close_time: hours.close_time
          }))
        )
      
      if (hoursError) throw hoursError

      // 5. Handle phone setup based on strategy
      if (phonePrefs.strategy === 'new_number') {
        console.log('🔄 Assigning new phone number...');
        const phoneResult = await VapiPhoneService.assignPhoneToSalon(
          business.id, 
          business.name
        );
        
        if (phoneResult.success) {
          // Save phone number mapping to database
          const { error: phoneError } = await supabase
            .from('phone_numbers')
            .insert({
              business_id: business.id,
              vapi_phone_id: phoneResult.vapiData.phoneNumberId,
              phone_number: phoneResult.phoneNumber,
              vapi_phone_number_id: phoneResult.phoneId
            });
          
          if (phoneError) {
            console.error('Phone mapping save failed:', phoneError);
          }
          
          // Update business with new phone number
          await supabase
            .from('businesses')
            .update({ 
              primary_phone_number: phoneResult.phoneNumber,
              vapi_assistant_id: '8ab7e000-aea8-4141-a471-33133219a471',
              forwarding_enabled: false,
              forwarding_rules: {
                sms_enabled: phonePrefs.smsEnabled,
                voice_enabled: phonePrefs.voiceEnabled,
                web_enabled: phonePrefs.webEnabled,
                widget_style: phonePrefs.widgetStyle
              }
            })
            .eq('id', business.id);
            
          setAssignedPhoneNumber(phoneResult.phoneNumber);
          console.log('✅ New phone number assigned:', phoneResult.phoneNumber);
        } else {
          console.warn('⚠️ Phone assignment failed:', phoneResult.error);
          setError(`Setup completed, but phone assignment failed: ${phoneResult.error}`);
        }
      } else if (phonePrefs.strategy === 'use_existing') {
        console.log('🔄 Configuring existing number for forwarding...');
        
        // Save existing number with forwarding configuration
        await supabase
          .from('businesses')
          .update({ 
            primary_phone_number: phonePrefs.existingNumber,
            vapi_assistant_id: '8ab7e000-aea8-4141-a471-33133219a471',
            forwarding_enabled: true,
            forwarding_number: phonePrefs.existingNumber,
            forwarding_rules: {
              forward_after_hours: phonePrefs.forwardAfterHours,
              forward_complex_calls: phonePrefs.forwardComplexCalls,
              strategy: 'use_existing',
              sms_enabled: phonePrefs.smsEnabled,
              voice_enabled: phonePrefs.voiceEnabled,
              web_enabled: phonePrefs.webEnabled,
              widget_style: phonePrefs.widgetStyle
            }
          })
          .eq('id', business.id);
        
        setAssignedPhoneNumber(phonePrefs.existingNumber);
        console.log('✅ Existing number configured for AI:', phonePrefs.existingNumber);
        
        // Note: Actual phone system integration would happen here
        // This might require manual coordination with phone provider
        setError('Phone configuration saved. Manual setup with your phone provider may be required.');
      }

      // 6. Store business ID in localStorage for dashboard
      localStorage.setItem('demo_business_id', business.id)
      
      // Success! Move to completion step
      setCurrentStep(7)
      
      // Don't auto-redirect - let user see phone number
      // setTimeout(() => {
      //   router.push('/dashboard')
      // }, 3000)
      
    } catch (error: any) {
      console.error('Onboarding error:', error)
      setError(error.message || 'Failed to complete onboarding')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Progress Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Salon Setup Wizard</h1>
            <div className="flex items-center space-x-8">
              {steps.map((step, index) => {
                const Icon = step.icon
                return (
                  <div
                    key={step.id}
                    className={`flex items-center ${
                      index < steps.length - 1 ? 'flex-1' : ''
                    }`}
                  >
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full ${
                        currentStep > step.id
                          ? 'bg-green-500 text-white'
                          : currentStep === step.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {currentStep > step.id ? (
                        <CheckCircleIcon className="w-6 h-6" />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`flex-1 h-1 mx-2 ${
                          currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Step 1: Business Info */}
        {currentStep === 1 && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold mb-4 text-center">Choose Your Plan</h2>
            <p className="text-gray-600 text-center mb-8">Select the channels that work best for your salon</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {PRICING_PLANS.map((plan) => (
                <div 
                  key={plan.id}
                  className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all ${
                    plan.popular 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-purple-300'
                  } ${subscriptionConfig.plan?.id === plan.id ? 'border-purple-600 bg-purple-100' : ''}`}
                  onClick={() => handlePlanSelection(plan)}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <div className="text-center">
                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                    <div className="mb-3">
                      <span className="text-3xl font-bold">${plan.price}</span>
                      <span className="text-gray-600">/month</span>
                    </div>
                    <p className="text-gray-600 mb-4">{plan.description}</p>
                    <div className="space-y-2 text-sm">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-center">
                          <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {subscriptionConfig.plan && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Add-On Features (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ADD_ONS.map((addon) => {
                    const isSelected = subscriptionConfig.addOns.some(a => a.id === addon.id)
                    return (
                      <div
                        key={addon.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          isSelected ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                        }`}
                        onClick={() => toggleAddOn(addon)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{addon.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{addon.description}</p>
                          </div>
                          <div className="ml-3 text-right">
                            <span className="font-bold">${addon.price}</span>
                            <span className="text-sm text-gray-600">/mo</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total Monthly:</span>
                    <span className="text-2xl font-bold text-purple-600">${subscriptionConfig.totalMonthly}/month</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {currentStep === 2 && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Tell us about your salon</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Salon Name *
                </label>
                <input
                  type="text"
                  value={businessInfo.name}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Sparkle Nails & Spa"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={businessInfo.email}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  placeholder="contact@sparklenails.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={businessInfo.phone}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  placeholder="(555) 123-4567"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={businessInfo.address}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  placeholder="123 Main Street, Suite 100, City, State 12345"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timezone
                </label>
                <select
                  value={businessInfo.timezone}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, timezone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                </select>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleBusinessInfoSubmit}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
              >
                Next Step
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Services */}
        {currentStep === 2 && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Select your services</h2>
            <p className="text-gray-600 mb-4">Choose from our suggested services or add your own</p>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {services.map((service, index) => (
                <div
                  key={index}
                  onClick={() => toggleService(index)}
                  className={`p-4 rounded-lg border cursor-pointer transition ${
                    (service as any).selected
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{service.name}</h3>
                      <p className="text-sm text-gray-600">
                        {service.duration} min • ${service.price}
                      </p>
                    </div>
                    {(service as any).selected && (
                      <CheckCircleIcon className="w-6 h-6 text-purple-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-3">Add Custom Service</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customService.name}
                  onChange={(e) => setCustomService({ ...customService, name: e.target.value })}
                  placeholder="Service name"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="number"
                  value={customService.duration}
                  onChange={(e) => setCustomService({ ...customService, duration: parseInt(e.target.value) || 30 })}
                  placeholder="Min"
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="number"
                  value={customService.price}
                  onChange={(e) => setCustomService({ ...customService, price: parseFloat(e.target.value) || 0 })}
                  placeholder="Price"
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
                />
                <button
                  onClick={addCustomService}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Back
              </button>
              <button
                onClick={() => setCurrentStep(4)}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
              >
                Next Step
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Staff */}
        {currentStep === 3 && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Add your team members</h2>
            <p className="text-gray-600 mb-4">Add nail technicians and other staff</p>
            
            <div className="space-y-4">
              {staff.map((member, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={member.first_name}
                      onChange={(e) => updateStaffMember(index, 'first_name', e.target.value)}
                      placeholder="First Name"
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="text"
                      value={member.last_name}
                      onChange={(e) => updateStaffMember(index, 'last_name', e.target.value)}
                      placeholder="Last Name"
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="email"
                      value={member.email}
                      onChange={(e) => updateStaffMember(index, 'email', e.target.value)}
                      placeholder="Email (optional)"
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="tel"
                      value={member.phone}
                      onChange={(e) => updateStaffMember(index, 'phone', e.target.value)}
                      placeholder="Phone (optional)"
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <select
                      value={member.role}
                      onChange={(e) => updateStaffMember(index, 'role', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="nail_technician">Nail Technician</option>
                      <option value="manager">Manager</option>
                      <option value="receptionist">Receptionist</option>
                    </select>
                    {staff.length > 1 && (
                      <button
                        onClick={() => removeStaffMember(index)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <button
              onClick={addStaffMember}
              className="mt-4 px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50"
            >
              + Add Another Staff Member
            </button>

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Back
              </button>
              <button
                onClick={() => setCurrentStep(4)}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
              >
                Next Step
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Business Hours */}
        {currentStep === 4 && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Set your business hours</h2>
            
            <div className="space-y-3">
              {DAYS.map((day, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={!businessHours[index].is_closed}
                      onChange={() => toggleDay(index)}
                      className="mr-3 h-5 w-5 text-purple-600"
                    />
                    <span className="font-medium w-28">{day}</span>
                  </div>
                  
                  {!businessHours[index].is_closed ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={businessHours[index].open_time}
                        onChange={(e) => updateHours(index, 'open_time', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <span>to</span>
                      <input
                        type="time"
                        value={businessHours[index].close_time}
                        onChange={(e) => updateHours(index, 'close_time', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  ) : (
                    <span className="text-gray-500">Closed</span>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setCurrentStep(3)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Back
              </button>
              <button
                onClick={() => setCurrentStep(5)}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
              >
                Next Step
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Phone Setup */}
        {currentStep === 5 && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">📞 Phone & AI Setup</h2>
            <p className="text-gray-600 mb-6">
              Choose how you'd like to integrate voice AI with your salon's phone system
            </p>
            
            <div className="space-y-4">
              {/* New Number Option */}
              <label className="flex items-start space-x-4 p-6 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-purple-300 transition">
                <input
                  type="radio"
                  value="new_number"
                  checked={phonePrefs.strategy === 'new_number'}
                  onChange={(e) => setPhonePrefs({ ...phonePrefs, strategy: e.target.value as any })}
                  className="mt-1 h-5 w-5 text-purple-600"
                />
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className="text-lg font-semibold">🆕 Get New AI Phone Number</span>
                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Recommended</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">
                    We'll assign you a dedicated phone number that customers can call for instant AI bookings 24/7
                  </p>
                  <div className="text-sm text-gray-500">
                    ✅ Immediate setup • ✅ Keep your existing number • ✅ Easy marketing
                  </div>
                </div>
              </label>

              {/* Existing Number Option */}
              <label className="flex items-start space-x-4 p-6 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-purple-300 transition">
                <input
                  type="radio"
                  value="use_existing"
                  checked={phonePrefs.strategy === 'use_existing'}
                  onChange={(e) => setPhonePrefs({ ...phonePrefs, strategy: e.target.value as any })}
                  className="mt-1 h-5 w-5 text-purple-600"
                />
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className="text-lg font-semibold">📱 Use Your Existing Number</span>
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Advanced</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">
                    Keep your current phone number. AI will handle bookings and forward complex calls to you
                  </p>
                  <div className="text-sm text-gray-500">
                    ✅ No number change • ✅ Smart call routing • ⚠️ Requires technical setup
                  </div>
                </div>
              </label>
            </div>

            {/* Existing Number Configuration */}
            {phonePrefs.strategy === 'use_existing' && (
              <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-xl">
                <h3 className="font-semibold mb-4">Configure Your Existing Number</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Current Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phonePrefs.existingNumber}
                      onChange={(e) => setPhonePrefs({ ...phonePrefs, existingNumber: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="(555) 123-4567"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This will require coordinating with your phone provider
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Smart Forwarding Rules:</h4>
                    
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={phonePrefs.forwardAfterHours}
                        onChange={(e) => setPhonePrefs({ ...phonePrefs, forwardAfterHours: e.target.checked })}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="text-sm">Forward calls during closed hours (AI handles bookings first)</span>
                    </label>
                    
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={phonePrefs.forwardComplexCalls}
                        onChange={(e) => setPhonePrefs({ ...phonePrefs, forwardComplexCalls: e.target.checked })}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="text-sm">Forward complex requests AI can't handle</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Booking Methods Selection */}
            <div className="mt-6 p-6 bg-gray-50 border border-gray-200 rounded-xl">
              <h3 className="font-semibold mb-4">📞 Choose Booking Methods:</h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={phonePrefs.voiceEnabled}
                    onChange={(e) => setPhonePrefs({ ...phonePrefs, voiceEnabled: e.target.checked })}
                    className="h-5 w-5 text-purple-600 rounded"
                  />
                  <div className="flex-1">
                    <span className="font-medium">Voice/Call Booking</span>
                    <p className="text-sm text-gray-600">Customers can call and speak with AI to book appointments</p>
                  </div>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={phonePrefs.smsEnabled}
                    onChange={(e) => setPhonePrefs({ ...phonePrefs, smsEnabled: e.target.checked })}
                    className="h-5 w-5 text-purple-600 rounded"
                  />
                  <div className="flex-1">
                    <span className="font-medium">SMS/Text Booking</span>
                    <p className="text-sm text-gray-600">Customers can text to book (e.g. "Book gel mani Friday 2pm")</p>
                  </div>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={phonePrefs.webEnabled}
                    onChange={(e) => setPhonePrefs({ ...phonePrefs, webEnabled: e.target.checked })}
                    className="h-5 w-5 text-purple-600 rounded"
                  />
                  <div className="flex-1">
                    <span className="font-medium">Online/Web Booking</span>
                    <p className="text-sm text-gray-600">Customers can book directly from your website with our widget</p>
                  </div>
                </label>
              </div>
              
              {phonePrefs.smsEnabled && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">📱 SMS Booking Examples:</h4>
                  <div className="space-y-1 text-sm text-blue-800">
                    <div>"Book gel mani tomorrow 2pm" → AI books appointment</div>
                    <div>"Available Friday?" → AI shows open times</div>
                    <div>"Cancel booking ABC123" → AI cancels appointment</div>
                  </div>
                </div>
              )}
              
              {phonePrefs.webEnabled && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">💻 Web Booking Widget:</h4>
                  <div className="space-y-2 text-sm text-green-800 mb-3">
                    <div>• Embeds on your existing website</div>
                    <div>• Mobile-friendly booking interface</div>
                    <div>• Real-time availability checking</div>
                    <div>• Automatic confirmation emails</div>
                  </div>
                  
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-green-900 mb-2">Widget Style:</label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          value="embedded"
                          checked={phonePrefs.widgetStyle === 'embedded'}
                          onChange={(e) => setPhonePrefs({ ...phonePrefs, widgetStyle: e.target.value as any })}
                          className="text-green-600"
                        />
                        <span className="text-sm">Embedded (fits in your website)</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          value="floating"
                          checked={phonePrefs.widgetStyle === 'floating'}
                          onChange={(e) => setPhonePrefs({ ...phonePrefs, widgetStyle: e.target.value as any })}
                          className="text-green-600"
                        />
                        <span className="text-sm">Floating button (bottom corner)</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          value="fullpage"
                          checked={phonePrefs.widgetStyle === 'fullpage'}
                          onChange={(e) => setPhonePrefs({ ...phonePrefs, widgetStyle: e.target.value as any })}
                          className="text-green-600"
                        />
                        <span className="text-sm">Full page (dedicated booking page)</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Call Flow Preview */}
            <div className="mt-6 p-6 bg-purple-50 border border-purple-200 rounded-xl">
              <h3 className="font-semibold mb-3">How it works:</h3>
              <div className="space-y-2 text-sm text-gray-700">
                {phonePrefs.strategy === 'new_number' ? (
                  <>
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 bg-purple-600 text-white text-xs rounded-full flex items-center justify-center">1</span>
                      <span>Customer calls your new AI phone number</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 bg-purple-600 text-white text-xs rounded-full flex items-center justify-center">2</span>
                      <span>AI answers instantly and helps book appointments</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 bg-purple-600 text-white text-xs rounded-full flex items-center justify-center">3</span>
                      <span>Booking appears in your dashboard immediately</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">1</span>
                      <span>Customer calls your existing number</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">2</span>
                      <span>AI answers and tries to help first</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">3</span>
                      <span>If AI can't help, call is forwarded to you</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setCurrentStep(4)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Back
              </button>
              <button
                onClick={completeOnboarding}
                disabled={isLoading || (phonePrefs.strategy === 'use_existing' && !phonePrefs.existingNumber)}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center disabled:opacity-50"
              >
                {isLoading ? 'Setting up...' : 'Complete Setup'}
                <CheckCircleIcon className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Complete */}
        {currentStep === 6 && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircleIcon className="w-12 h-12 text-green-600" />
              </div>
            </div>
            
            <h2 className="text-3xl font-bold mb-4">Setup Complete!</h2>
            <p className="text-xl text-gray-600 mb-4">
              Your salon is ready to start accepting bookings
            </p>
            
            {assignedPhoneNumber && (
              <div className={`border rounded-lg p-6 mb-6 ${phonePrefs.strategy === 'new_number' 
                ? 'bg-green-50 border-green-200' 
                : 'bg-blue-50 border-blue-200'
              }`}>
                <h3 className={`text-lg font-semibold mb-2 ${phonePrefs.strategy === 'new_number'
                  ? 'text-green-800'
                  : 'text-blue-800'
                }`}>
                  📞 {phonePrefs.strategy === 'new_number' 
                    ? 'Your New Voice AI Phone Number:' 
                    : 'Your Enhanced Phone Number:'
                  }
                </h3>
                <div className={`text-3xl font-bold mb-2 ${phonePrefs.strategy === 'new_number'
                  ? 'text-green-600'
                  : 'text-blue-600'
                }`}>
                  {VapiPhoneService.formatPhoneNumber(assignedPhoneNumber)}
                </div>
                <p className={`text-sm ${phonePrefs.strategy === 'new_number'
                  ? 'text-green-700'
                  : 'text-blue-700'
                }`}>
                  {phonePrefs.strategy === 'new_number' 
                    ? 'Customers can call this number 24/7 to book appointments automatically!'
                    : 'Your existing number now has AI superpowers! Bookings handled automatically with smart forwarding.'
                  }
                </p>
                
                {phonePrefs.strategy === 'use_existing' && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-xs text-yellow-800">
                      <strong>Next Step:</strong> We'll contact you within 24 hours to complete the phone system integration with your provider.
                    </p>
                  </div>
                )}
              </div>
            )}
            
            <div className="bg-purple-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold mb-2">What's Ready:</h3>
              <ul className="text-left space-y-2 text-gray-700">
                <li>✅ Your dashboard is ready to use</li>
                {phonePrefs.voiceEnabled && <li>✅ Voice AI booking system is configured</li>}
                {phonePrefs.smsEnabled && <li>✅ SMS/Text booking is enabled</li>}
                {phonePrefs.webEnabled && <li>✅ Online booking widget is ready</li>}
                {assignedPhoneNumber ? (
                  <li>✅ Phone number assigned and ready for calls</li>
                ) : (
                  <li>⚠️ Phone number assignment pending (check with support)</li>
                )}
                <li>📊 Start accepting bookings across all channels!</li>
              </ul>
            </div>
            
            {phonePrefs.webEnabled && business?.id && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-green-800 mb-3">💻 Your Booking Widget:</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-1">Widget URL:</label>
                    <div className="bg-white border border-green-200 rounded px-3 py-2 text-sm font-mono">
                      {typeof window !== 'undefined' ? `${window.location.origin}/widget/${business.id}` : `https://yourdomain.com/widget/${business.id}`}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-1">Embed Code:</label>
                    <div className="bg-white border border-green-200 rounded px-3 py-2 text-xs font-mono">
                      {`<iframe src="${typeof window !== 'undefined' ? window.location.origin : 'https://yourdomain.com'}/widget/${business.id}" width="400" height="600" frameborder="0"></iframe>`}
                    </div>
                  </div>
                  
                  <p className="text-xs text-green-700">
                    Copy this code to your website where you want the booking widget to appear
                  </p>
                </div>
              </div>
            )}
            
            <button
              onClick={() => router.push('/dashboard')}
              className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Go to Dashboard Now
            </button>
          </div>
        )}
      </div>
    </div>
  )
}