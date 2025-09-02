'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { VapiPhoneService } from '../../lib/vapi-phone-service'
import SocialMediaKit from '../../components/SocialMediaKit'

// Vapi configuration
const SHARED_ASSISTANT_ID = '8ab7e000-aea8-4141-a471-33133219a471'

import { 
  BuildingStorefrontIcon,
  ScissorsIcon,
  UserGroupIcon,
  ClockIcon,
  PhoneIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'

interface BusinessInfo {
  name: string
  email: string
  phone: string
  address: string
  timezone: string
  website?: string
  ownerFirstName?: string
  ownerLastName?: string
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

interface LocationSetup {
  name: string
  address: string
  city: string
  state: string
  postal_code: string
  phone: string
  email: string
}

interface PaymentSetup {
  processor: 'square' | 'stripe' | 'both'
  squareEnabled: boolean
  stripeEnabled: boolean
  squareApiKey: string
  stripeApiKey: string
  tipEnabled: boolean
  tipPercentages: number[]
}

interface LoyaltySetup {
  enabled: boolean
  programName: string
  pointsPerDollar: number
  pointsPerVisit: number
  rewardTiers: Array<{
    points: number
    reward: string
    discount: number
  }>
}

interface CommunicationSetup {
  smsEnabled: boolean
  emailEnabled: boolean
  reminderTiming: {
    sms24h: boolean
    sms2h: boolean
    email24h: boolean
    emailConfirmation: boolean
  }
  notificationTypes: {
    confirmations: boolean
    reminders: boolean
    cancellations: boolean
    promotions: boolean
  }
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

interface BrandingOptions {
  primaryColor: string
  logo?: string
  welcomeMessage: string
  businessDescription: string
}

interface SubscriptionConfig {
  plan: PricingPlan | null
  addOns: AddOn[]
  totalMonthly: number
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 47,
    channels: ['web', 'voice'],
    description: 'Perfect for solo techs & small salons',
    features: [
      '24/7 AI Voice Assistant',
      'Smart Web Booking Widget', 
      'Unlimited Appointments',
      'SMS Text Confirmations',
      'Customer Management',
      'Single Location'
    ]
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 97,
    channels: ['web', 'voice', 'sms'],
    description: 'Everything you need to grow',
    features: [
      'Everything in Starter',
      'Square/Stripe Payments',
      'Loyalty Points Program',
      'Advanced Analytics',
      'Staff Management',
      'Email Marketing',
      'Custom Branding'
    ],
    popular: true
  },
  {
    id: 'business',
    name: 'Business',
    price: 197,
    channels: ['web', 'voice', 'sms'],
    description: 'Scale with multiple locations',
    features: [
      'Everything in Professional',
      'Up to 3 Locations',
      'Cross-Location Analytics',
      'Advanced Reporting',
      'Priority Phone Support',
      'Custom Integrations',
      'White-Label Options'
    ]
  }
]

const ADD_ONS: AddOn[] = [
  {
    id: 'tech-calendars',
    name: 'Individual Tech Calendars',
    price: 15,
    description: 'Separate calendars for each technician with auto-assignment ($15 per tech)',
    category: 'business'
  },
  {
    id: 'multi-language',
    name: 'Multi-Language Support',
    price: 29, 
    description: 'Spanish, French, and other language options',
    category: 'communication'
  },
  {
    id: 'premium-support',
    name: 'Premium Support',
    price: 49,
    description: '1-hour response time and dedicated account manager',
    category: 'business'
  },
  {
    id: 'custom-training',
    name: 'Custom AI Training',
    price: 99,
    description: 'Salon-specific AI knowledge and personalized responses',
    category: 'ai'
  }
]

const DEFAULT_SERVICES: Service[] = [
  // Manicure Services
  { name: 'Classic Manicure', duration: 30, price: 25, category: 'manicure' },
  { name: 'Gel Manicure', duration: 45, price: 45, category: 'manicure' },
  { name: 'Dip Powder Manicure', duration: 60, price: 55, category: 'manicure' },
  { name: 'Acrylic Full Set', duration: 90, price: 65, category: 'manicure' },
  { name: 'Acrylic Fill', duration: 60, price: 40, category: 'manicure' },
  
  // Pedicure Services
  { name: 'Classic Pedicure', duration: 45, price: 35, category: 'pedicure' },
  { name: 'Gel Pedicure', duration: 60, price: 55, category: 'pedicure' },
  { name: 'Luxury Spa Pedicure', duration: 75, price: 75, category: 'pedicure' },
  
  // Combo Packages
  { name: 'Classic Mani-Pedi', duration: 75, price: 55, category: 'combo' },
  { name: 'Gel Mani-Pedi', duration: 105, price: 95, category: 'combo' },
  { name: 'Luxury Spa Package', duration: 120, price: 125, category: 'combo' },
  
  // Add-on Services
  { name: 'Nail Art (per nail)', duration: 5, price: 5, category: 'addon' },
  { name: 'French Tips', duration: 15, price: 15, category: 'addon' },
  { name: 'Chrome/Mirror Finish', duration: 10, price: 10, category: 'addon' },
  { name: 'Paraffin Treatment', duration: 15, price: 15, category: 'addon' },
  { name: 'Nail Repair', duration: 10, price: 10, category: 'addon' }
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
  const [techCalendarCount, setTechCalendarCount] = useState(0)
  
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
    { first_name: '', last_name: '', email: '', phone: '', role: 'technician' }
  ])
  
  const [businessHours, setBusinessHours] = useState<BusinessHours>(DEFAULT_HOURS)
  
  const [phonePrefs, setPhonePrefs] = useState<PhonePreferences>({
    strategy: 'new_number',
    existingNumber: '',
    forwardingEnabled: true,
    forwardAfterHours: true,
    forwardComplexCalls: true,
    smsEnabled: false,
    voiceEnabled: true,
    webEnabled: true,
    widgetStyle: 'embedded'
  })

  const [locations, setLocations] = useState<LocationSetup[]>([
    { name: '', address: '', city: '', state: '', postal_code: '', phone: '', email: '' }
  ])

  const [paymentSetup, setPaymentSetup] = useState<PaymentSetup>({
    processor: 'square',
    squareEnabled: true,
    stripeEnabled: false,
    squareApiKey: '',
    stripeApiKey: '',
    tipEnabled: true,
    tipPercentages: [15, 18, 20, 25]
  })

  const [loyaltySetup, setLoyaltySetup] = useState<LoyaltySetup>({
    enabled: true,
    programName: 'Loyalty Rewards',
    pointsPerDollar: 1,
    pointsPerVisit: 0,
    rewardTiers: [
      { points: 100, reward: '$5 off next service', discount: 500 },
      { points: 250, reward: '$15 off next service', discount: 1500 },
      { points: 500, reward: '$35 off next service', discount: 3500 }
    ]
  })

  const [communicationSetup, setCommunicationSetup] = useState<CommunicationSetup>({
    smsEnabled: true,
    emailEnabled: true,
    reminderTiming: {
      sms24h: true,
      sms2h: true,
      email24h: true,
      emailConfirmation: true
    },
    notificationTypes: {
      confirmations: true,
      reminders: true,
      cancellations: true,
      promotions: false
    }
  })

  const getSteps = () => {
    const baseSteps = [
      { id: 1, name: 'Plan Selection', icon: CurrencyDollarIcon },
      { id: 2, name: 'Business Info', icon: BuildingStorefrontIcon },
      { id: 3, name: 'Services', icon: ScissorsIcon },
      { id: 4, name: 'Staff', icon: UserGroupIcon },
      { id: 5, name: 'Hours', icon: ClockIcon }
    ]

    let dynamicSteps = [...baseSteps]
    let stepCounter = 6

    // Add location setup ONLY for Business tier (Multi-location feature)
    if (subscriptionConfig.plan?.id === 'business') {
      dynamicSteps.push({ id: stepCounter++, name: 'Locations', icon: BuildingStorefrontIcon })
    }

    // Add payment setup ONLY for Professional and Business tiers
    if (subscriptionConfig.plan?.id === 'professional' || subscriptionConfig.plan?.id === 'business') {
      dynamicSteps.push({ id: stepCounter++, name: 'Payments', icon: CurrencyDollarIcon })
    }

    // Add loyalty setup ONLY for Professional and Business tiers
    if (subscriptionConfig.plan?.id === 'professional' || subscriptionConfig.plan?.id === 'business') {
      dynamicSteps.push({ id: stepCounter++, name: 'Loyalty', icon: CheckCircleIcon })
    }

    // Communication setup for all tiers (SMS/Email notifications)
    dynamicSteps.push({ id: stepCounter++, name: 'Communication', icon: ChatBubbleLeftRightIcon })

    // Always add phone setup and complete
    dynamicSteps.push(
      { id: stepCounter++, name: 'Phone Setup', icon: PhoneIcon },
      { id: stepCounter++, name: 'Complete', icon: CheckCircleIcon }
    )

    return dynamicSteps
  }

  const steps = getSteps()

  // Helper functions to get dynamic step numbers
  const getLocationStepId = () => steps.find(s => s.name === 'Locations')?.id
  const getPaymentStepId = () => steps.find(s => s.name === 'Payments')?.id
  const getLoyaltyStepId = () => steps.find(s => s.name === 'Loyalty')?.id
  const getCommunicationStepId = () => steps.find(s => s.name === 'Communication')?.id
  const getPhoneStepId = () => steps.find(s => s.name === 'Phone Setup')?.id
  const getCompleteStepId = () => steps.find(s => s.name === 'Complete')?.id

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
      smsEnabled: false, // SMS booking disabled
      voiceEnabled: plan.channels.includes('voice'),
      webEnabled: plan.channels.includes('web')
    })
    
    setCurrentStep(2)
  }

  const toggleAddOn = (addon: AddOn) => {
    const isSelected = subscriptionConfig.addOns.some(a => a.id === addon.id)
    
    if (addon.id === 'tech-calendars') {
      // Handle tech calendars specially - need to show count selector
      if (isSelected) {
        // Remove tech calendars
        const newAddOns = subscriptionConfig.addOns.filter(a => a.id !== addon.id)
        setTechCalendarCount(0)
        const newConfig = {
          ...subscriptionConfig,
          addOns: newAddOns,
          totalMonthly: (subscriptionConfig.plan?.price || 0) + newAddOns.reduce((sum, a) => sum + a.price, 0)
        }
        setSubscriptionConfig(newConfig)
      } else {
        // Add tech calendars with default count
        setTechCalendarCount(staff.length || 1)
      }
    } else {
      // Handle regular add-ons
      const newAddOns = isSelected 
        ? subscriptionConfig.addOns.filter(a => a.id !== addon.id)
        : [...subscriptionConfig.addOns, addon]
      
      const techCalendarAddon = subscriptionConfig.addOns.find(a => a.id === 'tech-calendars')
      const techCalendarCost = techCalendarAddon ? techCalendarCount * 15 : 0
      
      const newConfig = {
        ...subscriptionConfig,
        addOns: newAddOns,
        totalMonthly: (subscriptionConfig.plan?.price || 0) + 
                     newAddOns.filter(a => a.id !== 'tech-calendars').reduce((sum, a) => sum + a.price, 0) +
                     techCalendarCost
      }
      setSubscriptionConfig(newConfig)
    }
  }
  
  const updateTechCalendarCount = (count: number) => {
    setTechCalendarCount(count)
    if (count > 0) {
      // Add or update tech calendars addon
      const otherAddOns = subscriptionConfig.addOns.filter(a => a.id !== 'tech-calendars')
      const techCalendarAddon = ADD_ONS.find(a => a.id === 'tech-calendars')!
      const newAddOns = [...otherAddOns, techCalendarAddon]
      
      const newConfig = {
        ...subscriptionConfig,
        addOns: newAddOns,
        totalMonthly: (subscriptionConfig.plan?.price || 0) + 
                     otherAddOns.reduce((sum, a) => sum + a.price, 0) +
                     (count * 15)
      }
      setSubscriptionConfig(newConfig)
    }
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

  const updateService = (index: number, field: 'name' | 'price' | 'duration', value: string | number) => {
    const newServices = [...services]
    if (field === 'name') {
      newServices[index].name = value as string
    } else if (field === 'price') {
      newServices[index].price = parseFloat(value as string) || 0
    } else if (field === 'duration') {
      newServices[index].duration = parseInt(value as string) || 30
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
    setStaff([...staff, { first_name: '', last_name: '', email: '', phone: '', role: 'technician' }])
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
      console.log('🔄 Starting onboarding completion...');
      console.log('📊 Environment check:', {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
        supabaseKeySet: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        vapiKeySet: !!process.env.NEXT_PUBLIC_VAPI_API_KEY
      });
      
      // 1. Create the business with complete info aligned with dashboard expectations
      const slug = businessInfo.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now()
      
      // Parse address for separate fields
      const addressParts = businessInfo.address.split(',')
      const address_line1 = addressParts[0]?.trim() || businessInfo.address
      const city = addressParts[1]?.trim() || ''
      const stateZip = addressParts[2]?.split(' ')
      const state = stateZip?.[0]?.trim() || ''
      const postal_code = stateZip?.[1]?.trim() || ''
      
      // Determine subscription tier from plan selection
      let subscriptionTier = 'starter'
      if (subscriptionConfig.plan?.id) {
        // Map old plan IDs to new billing system tiers
        const tierMapping = {
          'starter': 'starter',
          'professional': 'professional', 
          'business': 'business',
          'enterprise': 'enterprise'
        }
        subscriptionTier = tierMapping[subscriptionConfig.plan.id as keyof typeof tierMapping] || 'starter'
      }
      
      // Extract owner name from first staff member or use business name
      const ownerStaff = staff.find(s => s.role === 'owner') || staff[0]
      const ownerFirstName = ownerStaff?.first_name || businessInfo.name.split(' ')[0] || 'Owner'
      const ownerLastName = ownerStaff?.last_name || ''
      
      // Create business settings object with tier-specific features
      const businessSettings = {
        currency: 'USD',
        booking_buffer_minutes: 15,
        cancellation_window_hours: 24,
        selected_plan: subscriptionTier,
        monthly_price: subscriptionTier === 'starter' ? 47 : subscriptionTier === 'professional' ? 97 : subscriptionTier === 'business' ? 197 : 47,
        tech_calendar_count: staff.filter(s => s.role === 'technician').length || 1,
        // Tier-specific features (strictly enforced)
        payment_processing_enabled: ['professional', 'business'].includes(subscriptionTier),
        loyalty_program_enabled: ['professional', 'business'].includes(subscriptionTier),
        multi_location_enabled: subscriptionTier === 'business',
        // Communication preferences (platform handles SMS/email)
        email_notifications_enabled: communicationSetup.emailEnabled,
        sms_notifications_enabled: communicationSetup.smsEnabled,
        // Notification timing preferences
        sms_24h_reminder: communicationSetup.reminderTiming.sms24h,
        sms_2h_reminder: communicationSetup.reminderTiming.sms2h,
        email_24h_reminder: communicationSetup.reminderTiming.email24h,
        email_confirmation: communicationSetup.reminderTiming.emailConfirmation,
        // Notification types
        send_confirmations: communicationSetup.notificationTypes.confirmations,
        send_reminders: communicationSetup.notificationTypes.reminders,
        send_cancellations: communicationSetup.notificationTypes.cancellations,
        send_promotions: communicationSetup.notificationTypes.promotions,
        // Generate webhook auth token (will add URLs after business creation)
        webhook_auth_token: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        // Branding
        primary_color: '#8B5CF6', // Default purple
        business_type: 'nail_salon'
      }
      
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .insert({
          name: businessInfo.name,
          slug: slug,
          business_type: 'nail_salon',
          email: businessInfo.email,
          phone: businessInfo.phone,
          website: '', // Can be added later
          address: address_line1, // Use single address field from database
          city: city,
          state: state,
          zip_code: postal_code, // Database uses zip_code not postal_code
          country: 'US',
          timezone: businessInfo.timezone,
          // Owner information for login compatibility
          owner_email: businessInfo.email,
          owner_first_name: ownerFirstName,
          owner_last_name: ownerLastName,
          // Subscription configuration
          subscription_tier: subscriptionTier,
          subscription_status: 'trialing',
          trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          // Business settings for dashboard
          settings: businessSettings,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (businessError) {
        console.error('❌ BUSINESS CREATION FAILED:');
        console.error('Full error:', businessError);
        console.error('Error message:', businessError.message);
        console.error('Error code:', businessError.code);
        console.error('Error details:', businessError.details);
        console.error('Error hint:', businessError.hint);
        console.error('Supabase URL being used:', process.env.NEXT_PUBLIC_SUPABASE_URL);
        console.error('Supabase key set:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
        throw new Error('SUPABASE_BUSINESS_ERROR: ' + businessError.message);
      }
      console.log('✅ Business created successfully:', business.id);
      
      // Store the created business in state
      setBusiness(business)
      
      // Update business settings with webhook URLs now that we have the business ID
      const webhookBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://vapi-nail-salon-agent-production.up.railway.app'
      const updatedSettings = {
        ...businessSettings,
        webhook_url: `${webhookBaseUrl}/webhook/vapi/${business.id}`,
        vapi_webhook_url: `${webhookBaseUrl}/webhook/vapi/${business.id}`,
        sms_webhook_url: `${webhookBaseUrl}/webhook/sms`,
        n8n_webhook_url: process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || '',
      }
      
      // Update the business with webhook URLs
      const { error: updateError } = await supabase
        .from('businesses')
        .update({ 
          settings: updatedSettings,
          updated_at: new Date().toISOString()
        })
        .eq('id', business.id)
      
      if (updateError) {
        console.error('❌ Failed to update business with webhook URLs:', updateError)
      } else {
        console.log('✅ Webhook URLs configured for business:', business.id)
      }

      // 2. Add selected services with enhanced customization support
      const selectedServices = services.filter((s: any) => s.selected)
      if (selectedServices.length > 0) {
        console.log('💅 Saving', selectedServices.length, 'customized services...')
        
        const { error: servicesError } = await supabase
          .from('services')
          .insert(
            selectedServices.map((service, index) => ({
              business_id: business.id,
              name: service.name, // Use exact custom name from user
              description: (service as any).description || `Professional ${service.name.toLowerCase()} service`,
              category: service.category,
              duration_minutes: service.duration,
              base_price: parseFloat(service.price.toString()), // Ensure proper decimal conversion
              is_active: true,
              requires_deposit: service.price >= 75, // Require deposit for services $75+
              deposit_amount: service.price >= 75 ? Math.round(service.price * 0.25) : 0, // 25% deposit
              display_order: index + 1, // Set display order based on selection order
              service_type: service.category === 'custom' ? 'custom' : 'standard',
              is_featured: service.price >= 100, // Feature expensive services
              max_advance_booking_days: service.category === 'combo' ? 60 : 30, // Longer booking window for combos
              min_advance_booking_hours: service.duration >= 90 ? 4 : 2, // More notice for long services
              settings: {
                original_category: service.category,
                customized_by_user: true,
                setup_during_onboarding: true
              },
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }))
          )
        
        if (servicesError) {
          console.error('❌ SERVICES INSERTION FAILED:');
          console.error('Services error:', servicesError);
          console.error('Services data being inserted:', selectedServices);
          throw new Error('SUPABASE_SERVICES_ERROR: ' + servicesError.message);
        }
      }

      // 3. Add staff members (enhanced with proper roles and default settings)
      const validStaff = staff.filter(s => s.first_name && s.last_name)
      if (validStaff.length > 0) {
        const { error: staffError } = await supabase
          .from('staff')
          .insert(
            validStaff.map(member => ({
              business_id: business.id,
              first_name: member.first_name,
              last_name: member.last_name,
              email: member.email || '',
              phone: member.phone || '',
              role: member.role,
              specialties: member.role === 'technician' ? selectedServices.map(s => s.name) : [],
              hourly_rate: member.role === 'technician' ? 25 : member.role === 'manager' ? 30 : 35,
              commission_rate: member.role === 'technician' ? 0.4 : member.role === 'manager' ? 0.3 : 0.2,
              is_active: true,
              hire_date: new Date().toISOString().split('T')[0],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }))
          )
        
        if (staffError) {
          console.error('❌ STAFF INSERTION FAILED:');
          console.error('Staff error:', staffError);
          console.error('Staff data being inserted:', validStaff);
          throw new Error('SUPABASE_STAFF_ERROR: ' + staffError.message);
        }
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
      
      if (hoursError) {
        console.error('❌ BUSINESS HOURS INSERTION FAILED:');
        console.error('Hours error:', hoursError);
        console.error('Hours data:', Object.entries(businessHours));
        throw new Error('SUPABASE_HOURS_ERROR: ' + hoursError.message);
      }

      console.log('✅ Core database operations completed successfully');

      // 5. Create primary location for Business tier
      if (subscriptionTier === 'business') {
        console.log('🏢 Creating primary location for Business tier...');
        try {
          const { error: locationError } = await supabase
            .from('locations')
            .insert({
              business_id: business.id,
              name: businessInfo.name + ' - Main Location',
              slug: slug + '-main',
              address_line1: address_line1,
              address_line2: '',
              city: city,
              state: state,
              postal_code: postal_code,
              country: 'US',
              phone: businessInfo.phone,
              email: businessInfo.email,
              timezone: businessInfo.timezone,
              is_active: true,
              is_primary: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          
          if (locationError) {
            console.error('❌ PRIMARY LOCATION CREATION FAILED:', locationError);
            // Don't fail onboarding for location creation
          } else {
            console.log('✅ Primary location created successfully');
          }
        } catch (locationErr) {
          console.warn('Location table may not exist yet:', locationErr);
          // Don't fail onboarding
        }
      }

      // 6. Initialize loyalty program for Professional+ tiers
      if (['professional', 'business'].includes(subscriptionTier)) {
        console.log('🎁 Setting up loyalty program for', subscriptionTier, 'tier...');
        try {
          const { error: loyaltyError } = await supabase
            .from('loyalty_programs')
            .insert({
              business_id: business.id,
              program_name: businessInfo.name + ' Rewards',
              is_active: true,
              points_per_dollar: 1,
              points_per_visit: 0,
              points_expire_days: 365,
              minimum_purchase_for_points: 0,
              reward_tiers: [
                { points: 100, reward: '$5 off next service', discount_amount: 500 },
                { points: 250, reward: '$15 off next service', discount_amount: 1500 },
                { points: 500, reward: '$35 off next service', discount_amount: 3500 }
              ],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          
          if (loyaltyError) {
            console.error('❌ LOYALTY PROGRAM CREATION FAILED:', loyaltyError);
            // Don't fail onboarding for loyalty program creation
          } else {
            console.log('✅ Loyalty program initialized successfully');
          }
        } catch (loyaltyErr) {
          console.warn('Loyalty program table may not exist yet:', loyaltyErr);
          // Don't fail onboarding
        }
      }

      console.log('✅ All enhanced database operations completed');
      
      // 7. Handle phone setup based on strategy
      if (phonePrefs.strategy === 'new_number') {
        console.log('🔄 Attempting to assign new phone number with Vapi...');
        try {
          const phoneResult = await VapiPhoneService.assignPhoneToSalon(
            business.id, 
            business.name
          );
          
          if (phoneResult.success) {
          // Save phone number mapping to database (optional - may not exist yet)
          try {
            const { error: phoneError } = await supabase
              .from('phone_numbers')
              .insert({
                business_id: business.id,
                vapi_phone_id: phoneResult.vapiData?.phoneNumberId || phoneResult.phoneId,
                phone_number: phoneResult.phoneNumber,
                vapi_phone_number_id: phoneResult.phoneId,
                is_primary: true
              });
            
            if (phoneError) {
              console.warn('Phone mapping save failed (table may not exist):', phoneError);
              // Don't fail onboarding for this
            }
          } catch (phoneMapError) {
            console.warn('Phone numbers table not available:', phoneMapError);
          }
          
          // Update business with new phone number and Vapi configuration
          const vapiSettings = {
            ...updatedSettings,
            vapi_assistant_id: SHARED_ASSISTANT_ID,
            vapi_phone_number_id: phoneResult.vapiData?.phoneNumberId || phoneResult.phoneId,
            vapi_phone_number: phoneResult.phoneNumber,
            vapi_configured: true
          }
          
          await supabase
            .from('businesses')
            .update({ 
              phone: phoneResult.phoneNumber,
              vapi_assistant_id: SHARED_ASSISTANT_ID,
              settings: vapiSettings
            })
            .eq('id', business.id);
            
          setAssignedPhoneNumber(phoneResult.phoneNumber);
          console.log('✅ New phone number assigned:', phoneResult.phoneNumber);
          } else {
            console.warn('⚠️ Phone assignment failed:', phoneResult.error);
            setError(`Setup completed, but phone assignment failed: ${phoneResult.error}`);
          }
        } catch (phoneError) {
          console.error('❌ Phone number assignment error:', phoneError);
          setError(`Setup completed, but phone assignment failed: ${phoneError.message}`);
          // Don't block onboarding completion for phone errors
        }
      } else if (phonePrefs.strategy === 'use_existing') {
        console.log('🔄 Configuring existing number for forwarding...');
        
        // Save existing number configuration with forwarding setup
        const forwardingSettings = {
          ...updatedSettings,
          existing_phone_number: phonePrefs.existingNumber,
          forwarding_enabled: true,
          forwarding_method: 'carrier_forwarding',
          forward_after_hours: phonePrefs.forwardAfterHours,
          forward_complex_calls: phonePrefs.forwardComplexCalls,
          ai_phone_number: assignedPhoneNumber,
          vapi_assistant_id: SHARED_ASSISTANT_ID,
          vapi_configured: true,
          forwarding_instructions: `Forward busy/no-answer calls from ${phonePrefs.existingNumber} to ${assignedPhoneNumber}`
        }
        
        await supabase
          .from('businesses')
          .update({ 
            phone: phonePrefs.existingNumber,
            vapi_assistant_id: SHARED_ASSISTANT_ID,
            settings: forwardingSettings
          })
          .eq('id', business.id);
        
        setAssignedPhoneNumber(phonePrefs.existingNumber);
        console.log('✅ Existing number configured with forwarding to AI:', phonePrefs.existingNumber, '→', assignedPhoneNumber);
      }

      // 6. Store business ID in localStorage for dashboard
      localStorage.setItem('demo_business_id', business.id)
      
      // 7. Auto-login the user after successful onboarding
      localStorage.setItem('authenticated_business_id', business.id)
      localStorage.setItem('authenticated_business_name', business.name)
      localStorage.setItem('authenticated_user_email', businessInfo.email)
      console.log('✅ Auto-login completed for:', business.name)
      
      // Success! Move to completion step
      const completeStepId = getCompleteStepId()
      if (completeStepId) {
        setCurrentStep(completeStepId)
      }
      
      // Auto-redirect to dashboard after user sees completion message
      setTimeout(() => {
        console.log('🚀 Redirecting to dashboard...')
        router.push('/dashboard')
      }, 5000) // 5 seconds to see the completion message
      
    } catch (error: any) {
      console.error('🚨 ONBOARDING FAILED - FULL ERROR DETAILS:');
      console.error('Error object:', error);
      console.error('Error message:', error?.message);
      console.error('Error stack:', error?.stack);
      console.error('Error code:', error?.code);
      console.error('Error details:', error?.details);
      console.error('Error hint:', error?.hint);
      
      // Check if this is a Supabase error
      if (error?.message?.includes('JWT') || error?.message?.includes('auth')) {
        setError('❌ SUPABASE AUTH ERROR: ' + error.message);
      } else if (error?.message?.includes('API key') || error?.message?.includes('401') || error?.message?.includes('403')) {
        setError('❌ API KEY ERROR: ' + error.message + ' - Check console for details');
      } else {
        setError('❌ UNKNOWN ERROR: ' + (error.message || 'Failed to complete onboarding') + ' - Check console');
      }
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

        {/* Step 1: Plan Selection */}
        {currentStep === 1 && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Choose Your AI Booking Plan</h2>
              <p className="text-lg text-gray-600 mb-2">Transform your salon with 24/7 AI-powered booking</p>
              <p className="text-sm text-gray-500 mb-6">All plans include a 14-day free trial • No credit card required</p>
              
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-sm font-bold">🎬</span>
                  </div>
                  <span className="font-semibold text-purple-800">Want to see it in action first?</span>
                </div>
                <a 
                  href="/demo"
                  className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-bold rounded-full hover:bg-purple-700 transition-colors shadow-lg"
                >
                  Try Interactive Demo
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </a>
                <p className="text-xs text-purple-600 mt-2">See exactly how AI booking transforms your salon • 3 minutes</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto mb-8 px-4">
              {PRICING_PLANS.map((plan) => (
                <div 
                  key={plan.id}
                  className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all transform hover:scale-105 ${
                    plan.popular 
                      ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-blue-50 shadow-xl md:scale-105' 
                      : 'border-gray-200 hover:border-purple-300 bg-white'
                  } ${subscriptionConfig.plan?.id === plan.id ? 'border-purple-600 bg-purple-100 ring-2 ring-purple-400' : ''}`}
                  onClick={() => handlePlanSelection(plan)}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                      <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg whitespace-nowrap">
                        🔥 MOST POPULAR
                      </span>
                    </div>
                  )}
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-2 mt-2">{plan.name}</h3>
                    <div className="mb-4">
                      <span className="text-4xl font-bold">${plan.price}</span>
                      <span className="text-gray-600 text-lg">/month</span>
                    </div>
                    <p className="text-gray-600 mb-6 text-sm font-medium min-h-[40px]">{plan.description}</p>
                    <div className="space-y-3 text-sm text-left">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-start">
                          <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                    {subscriptionConfig.plan?.id === plan.id && (
                      <div className="mt-4 pt-4 border-t border-purple-300">
                        <span className="text-purple-600 font-semibold">✓ Selected</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {subscriptionConfig.plan && (
              <div className="border-t pt-6">
                {/* Show what's included in their selected plan */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-purple-800 mb-2">✨ Your {subscriptionConfig.plan.name} Plan Includes:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center">
                      <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                      <span>24/7 AI Voice Assistant</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                      <span>Web Booking Widget</span>
                    </div>
                    {subscriptionConfig.plan.id === 'professional' || subscriptionConfig.plan.id === 'business' ? (
                      <>
                        <div className="flex items-center">
                          <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                          <span>Payment Processing (Square/Stripe)</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                          <span>Loyalty Points Program</span>
                        </div>
                      </>
                    ) : null}
                    {subscriptionConfig.plan.id === 'business' ? (
                      <>
                        <div className="flex items-center">
                          <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                          <span>Multi-Location Support (up to 3)</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                          <span>Priority Support</span>
                        </div>
                      </>
                    ) : null}
                  </div>
                  {subscriptionConfig.plan.id === 'starter' && (
                    <div className="mt-3 text-xs text-purple-600">
                      💡 Upgrade to Professional to unlock Payment Processing & Loyalty Program
                    </div>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold mb-4">Add-On Features (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ADD_ONS.map((addon) => {
                    const isSelected = subscriptionConfig.addOns.some(a => a.id === addon.id)
                    const isTechCalendars = addon.id === 'tech-calendars'
                    
                    return (
                      <div
                        key={addon.id}
                        className={`border rounded-lg p-4 transition-all ${
                          isSelected ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                        } ${isTechCalendars && !isSelected ? 'cursor-pointer' : ''}`}
                        onClick={isTechCalendars && !isSelected ? () => toggleAddOn(addon) : undefined}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{addon.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{addon.description}</p>
                            
                            {isTechCalendars && (techCalendarCount > 0 || isSelected) && (
                              <div className="mt-3">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Number of technicians:
                                </label>
                                <div className="flex items-center space-x-3">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      if (techCalendarCount > 1) updateTechCalendarCount(techCalendarCount - 1)
                                    }}
                                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
                                    disabled={techCalendarCount <= 1}
                                  >
                                    -
                                  </button>
                                  <span className="px-4 py-1 border border-gray-300 rounded bg-white min-w-[3rem] text-center">
                                    {techCalendarCount}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      updateTechCalendarCount(techCalendarCount + 1)
                                    }}
                                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
                                  >
                                    +
                                  </button>
                                </div>
                                <div className="mt-2 flex justify-between items-center">
                                  <span className="text-sm text-gray-600">
                                    ${techCalendarCount * 15}/month total
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      toggleAddOn(addon)
                                    }}
                                    className="text-sm text-red-600 hover:text-red-700"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                          {!isTechCalendars && (
                            <div className="ml-3 text-right">
                              <div
                                className="cursor-pointer"
                                onClick={() => toggleAddOn(addon)}
                              >
                                <span className="font-bold">${addon.price}</span>
                                <span className="text-sm text-gray-600">/mo</span>
                              </div>
                            </div>
                          )}
                          {isTechCalendars && techCalendarCount === 0 && !isSelected && (
                            <div className="ml-3 text-right">
                              <span className="font-bold">$15</span>
                              <span className="text-sm text-gray-600">/tech</span>
                            </div>
                          )}
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

        {/* Step 3: Services */}
        {currentStep === 3 && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Customize Your Services</h2>
            <p className="text-gray-600 mb-2">Select services and customize names, prices, and duration to match your salon</p>
            <p className="text-sm text-purple-600 mb-4">💡 Tip: Click on a service to select it, then edit the details as needed</p>
            
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {services.map((service, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border transition-all ${
                    (service as any).selected
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <div 
                      onClick={() => toggleService(index)}
                      className="pt-1 cursor-pointer"
                    >
                      {(service as any).selected ? (
                        <CheckCircleIcon className="w-6 h-6 text-purple-600" />
                      ) : (
                        <div className="w-6 h-6 border-2 border-gray-300 rounded-full" />
                      )}
                    </div>
                    
                    {/* Editable Service Details */}
                    <div className="flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Service Name */}
                        <div className="md:col-span-1">
                          <label className="text-xs text-gray-500 mb-1 block">Service Name</label>
                          <input
                            type="text"
                            value={service.name}
                            onChange={(e) => updateService(index, 'name', e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-sm"
                            placeholder="Service name"
                          />
                        </div>
                        
                        {/* Price */}
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Price ($)</label>
                          <input
                            type="number"
                            value={service.price}
                            onChange={(e) => updateService(index, 'price', e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-sm"
                            placeholder="Price"
                            min="0"
                            step="5"
                          />
                        </div>
                        
                        {/* Duration */}
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Duration (min)</label>
                          <input
                            type="number"
                            value={service.duration}
                            onChange={(e) => updateService(index, 'duration', e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-sm"
                            placeholder="Minutes"
                            min="5"
                            step="5"
                          />
                        </div>
                      </div>
                      
                      {/* Category Badge */}
                      <div className="mt-2">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                          service.category === 'manicure' ? 'bg-pink-100 text-pink-700' :
                          service.category === 'pedicure' ? 'bg-blue-100 text-blue-700' :
                          service.category === 'combo' ? 'bg-purple-100 text-purple-700' :
                          service.category === 'addon' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {service.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
              <h3 className="font-semibold mb-3">➕ Add Custom Service</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <input
                  type="text"
                  value={customService.name}
                  onChange={(e) => setCustomService({ ...customService, name: e.target.value })}
                  placeholder="Service name"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                />
                <input
                  type="number"
                  value={customService.price || ''}
                  onChange={(e) => setCustomService({ ...customService, price: parseFloat(e.target.value) || 0 })}
                  placeholder="Price ($)"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  min="0"
                  step="5"
                />
                <input
                  type="number"
                  value={customService.duration}
                  onChange={(e) => setCustomService({ ...customService, duration: parseInt(e.target.value) || 30 })}
                  placeholder="Duration (min)"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  min="5"
                  step="5"
                />
                <button
                  onClick={addCustomService}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
                >
                  ➕ Add Service
                </button>
              </div>
            </div>
            
            {/* Selected Services Summary */}
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>✅ {services.filter((s: any) => s.selected).length} services selected</strong>
                {services.filter((s: any) => s.selected).length > 0 && (
                  <span className="ml-2 text-green-600">
                    (Total value: ${services.filter((s: any) => s.selected).reduce((sum, s) => sum + s.price, 0)})
                  </span>
                )}
              </p>
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

        {/* Step 4: Staff */}
        {currentStep === 4 && (
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
                      <option value="technician">Nail Technician</option>
                      <option value="manager">Manager</option>
                      <option value="owner">Owner</option>
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

        {/* Step 5: Business Hours */}
        {currentStep === 5 && (
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
                onClick={() => setCurrentStep(4)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Back
              </button>
              <button
                onClick={() => {
                  // Navigate to next step based on plan
                  const locationStepId = getLocationStepId()
                  const paymentStepId = getPaymentStepId()
                  const phoneStepId = getPhoneStepId()
                  
                  if (locationStepId) {
                    setCurrentStep(locationStepId)
                  } else if (paymentStepId) {
                    setCurrentStep(paymentStepId)
                  } else if (phoneStepId) {
                    setCurrentStep(phoneStepId)
                  }
                }}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
              >
                Next Step
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* Location Setup Step (Business tier only) */}
        {currentStep === getLocationStepId() && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">🏢 Location Management Setup</h2>
            <p className="text-gray-600 mb-6">
              Set up your salon locations. You can manage up to 3 locations with the Business plan.
            </p>
            
            <div className="space-y-4">
              {locations.map((location, index) => (
                <div key={index} className="p-6 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">
                      {index === 0 ? 'Primary Location' : `Location ${index + 1}`}
                    </h3>
                    {index > 0 && (
                      <button
                        onClick={() => setLocations(locations.filter((_, i) => i !== index))}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={location.name}
                      onChange={(e) => {
                        const newLocations = [...locations]
                        newLocations[index].name = e.target.value
                        setLocations(newLocations)
                      }}
                      placeholder="Location Name"
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="text"
                      value={location.address}
                      onChange={(e) => {
                        const newLocations = [...locations]
                        newLocations[index].address = e.target.value
                        setLocations(newLocations)
                      }}
                      placeholder="Street Address"
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="text"
                      value={location.city}
                      onChange={(e) => {
                        const newLocations = [...locations]
                        newLocations[index].city = e.target.value
                        setLocations(newLocations)
                      }}
                      placeholder="City"
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="text"
                      value={location.state}
                      onChange={(e) => {
                        const newLocations = [...locations]
                        newLocations[index].state = e.target.value
                        setLocations(newLocations)
                      }}
                      placeholder="State"
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="text"
                      value={location.postal_code}
                      onChange={(e) => {
                        const newLocations = [...locations]
                        newLocations[index].postal_code = e.target.value
                        setLocations(newLocations)
                      }}
                      placeholder="ZIP Code"
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="tel"
                      value={location.phone}
                      onChange={(e) => {
                        const newLocations = [...locations]
                        newLocations[index].phone = e.target.value
                        setLocations(newLocations)
                      }}
                      placeholder="Phone (optional)"
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              ))}
            </div>

            {locations.length < 3 && (
              <button
                onClick={() => setLocations([...locations, { name: '', address: '', city: '', state: '', postal_code: '', phone: '', email: '' }])}
                className="mt-4 px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50"
              >
                + Add Another Location
              </button>
            )}

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setCurrentStep(5)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Back
              </button>
              <button
                onClick={() => {
                  const paymentStepId = getPaymentStepId()
                  const phoneStepId = getPhoneStepId()
                  
                  if (paymentStepId) {
                    setCurrentStep(paymentStepId)
                  } else if (phoneStepId) {
                    setCurrentStep(phoneStepId)
                  }
                }}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
              >
                Next Step
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* Payment Setup Step (Professional+ tiers) */}
        {currentStep === getPaymentStepId() && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">💳 Payment Processing Setup</h2>
            <p className="text-gray-600 mb-6">
              Configure payment processing to accept payments directly through your booking system.
            </p>
            
            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Choose Payment Processor</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                    paymentSetup.squareEnabled ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                  }`}>
                    <input
                      type="checkbox"
                      checked={paymentSetup.squareEnabled}
                      onChange={(e) => setPaymentSetup({ ...paymentSetup, squareEnabled: e.target.checked })}
                      className="mr-3 h-5 w-5 text-purple-600"
                    />
                    <div>
                      <div className="font-semibold">Square</div>
                      <div className="text-sm text-gray-600">2.6% + 10¢ per transaction</div>
                    </div>
                  </label>
                  
                  <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                    paymentSetup.stripeEnabled ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                  }`}>
                    <input
                      type="checkbox"
                      checked={paymentSetup.stripeEnabled}
                      onChange={(e) => setPaymentSetup({ ...paymentSetup, stripeEnabled: e.target.checked })}
                      className="mr-3 h-5 w-5 text-purple-600"
                    />
                    <div>
                      <div className="font-semibold">Stripe</div>
                      <div className="text-sm text-gray-600">2.9% + 30¢ per transaction</div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Tip Settings</h3>
                <label className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    checked={paymentSetup.tipEnabled}
                    onChange={(e) => setPaymentSetup({ ...paymentSetup, tipEnabled: e.target.checked })}
                    className="mr-3 h-5 w-5 text-purple-600"
                  />
                  <span>Enable tips during checkout</span>
                </label>
                
                {paymentSetup.tipEnabled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Suggested tip percentages:
                    </label>
                    <div className="flex gap-2">
                      {[15, 18, 20, 25].map(percentage => (
                        <label key={percentage} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={paymentSetup.tipPercentages.includes(percentage)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setPaymentSetup({
                                  ...paymentSetup,
                                  tipPercentages: [...paymentSetup.tipPercentages, percentage].sort()
                                })
                              } else {
                                setPaymentSetup({
                                  ...paymentSetup,
                                  tipPercentages: paymentSetup.tipPercentages.filter(p => p !== percentage)
                                })
                              }
                            }}
                            className="mr-1 h-4 w-4 text-purple-600"
                          />
                          <span>{percentage}%</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">Setup Required</h4>
                <p className="text-sm text-yellow-700">
                  After onboarding, you'll need to provide your payment processor API keys in the dashboard settings.
                  Don't worry - we'll guide you through the process!
                </p>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => {
                  const locationStepId = getLocationStepId()
                  if (locationStepId) {
                    setCurrentStep(locationStepId)
                  } else {
                    setCurrentStep(5)
                  }
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Back
              </button>
              <button
                onClick={() => {
                  const loyaltyStepId = getLoyaltyStepId()
                  const phoneStepId = getPhoneStepId()
                  
                  if (loyaltyStepId) {
                    setCurrentStep(loyaltyStepId)
                  } else if (phoneStepId) {
                    setCurrentStep(phoneStepId)
                  }
                }}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
              >
                Next Step
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* Loyalty Program Setup Step (Professional+ tiers) */}
        {currentStep === getLoyaltyStepId() && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">🎁 Loyalty Program Setup</h2>
            <p className="text-gray-600 mb-6">
              Set up a points-based loyalty program to reward your regular customers and increase retention.
            </p>
            
            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <label className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    checked={loyaltySetup.enabled}
                    onChange={(e) => setLoyaltySetup({ ...loyaltySetup, enabled: e.target.checked })}
                    className="mr-3 h-5 w-5 text-purple-600"
                  />
                  <span className="text-lg font-semibold">Enable Loyalty Program</span>
                </label>
                
                {loyaltySetup.enabled && (
                  <div className="space-y-4 ml-8">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Program Name
                      </label>
                      <input
                        type="text"
                        value={loyaltySetup.programName}
                        onChange={(e) => setLoyaltySetup({ ...loyaltySetup, programName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Loyalty Rewards"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Points per $1 spent
                        </label>
                        <input
                          type="number"
                          value={loyaltySetup.pointsPerDollar}
                          onChange={(e) => setLoyaltySetup({ ...loyaltySetup, pointsPerDollar: parseInt(e.target.value) || 1 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          min="1"
                          max="10"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Points per visit
                        </label>
                        <input
                          type="number"
                          value={loyaltySetup.pointsPerVisit}
                          onChange={(e) => setLoyaltySetup({ ...loyaltySetup, pointsPerVisit: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          min="0"
                          max="50"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {loyaltySetup.enabled && (
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Reward Tiers</h3>
                  <div className="space-y-3">
                    {loyaltySetup.rewardTiers.map((tier, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm">
                          <span className="font-medium">{tier.points} points</span> = 
                          <span className="ml-1">{tier.reward}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          (${(tier.discount / 100).toFixed(2)} value)
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    You can customize these reward tiers later in your dashboard settings.
                  </p>
                </div>
              )}

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-2">How it works</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Customers earn points automatically when they spend money</li>
                  <li>• Points can be redeemed for discounts on future services</li>
                  <li>• Loyalty data integrates with your customer management system</li>
                  <li>• Track program performance through analytics dashboard</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => {
                  const paymentStepId = getPaymentStepId()
                  const locationStepId = getLocationStepId()
                  
                  if (paymentStepId) {
                    setCurrentStep(paymentStepId)
                  } else if (locationStepId) {
                    setCurrentStep(locationStepId)
                  } else {
                    setCurrentStep(5)
                  }
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Back
              </button>
              <button
                onClick={() => {
                  const phoneStepId = getPhoneStepId()
                  if (phoneStepId) {
                    setCurrentStep(phoneStepId)
                  }
                }}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
              >
                Next Step
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* Communication Setup Step */}
        {currentStep === getCommunicationStepId() && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">💬 Customer Communication Preferences</h2>
            <p className="text-gray-600 mb-6">
              Choose how you'd like to communicate with your customers. We handle all the technical setup - you just choose what and when to send.
            </p>

            {/* Communication Channels */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">📞 Communication Channels</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 border-2 border-green-200 bg-green-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-green-800">📱 SMS Notifications</h4>
                    <p className="text-sm text-green-600">Fast, direct customer communication</p>
                  </div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={communicationSetup.smsEnabled}
                      onChange={(e) => setCommunicationSetup({
                        ...communicationSetup,
                        smsEnabled: e.target.checked
                      })}
                      className="h-5 w-5 text-green-600 rounded"
                    />
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border-2 border-blue-200 bg-blue-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-blue-800">📧 Email Notifications</h4>
                    <p className="text-sm text-blue-600">Professional, detailed confirmations</p>
                  </div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={communicationSetup.emailEnabled}
                      onChange={(e) => setCommunicationSetup({
                        ...communicationSetup,
                        emailEnabled: e.target.checked
                      })}
                      className="h-5 w-5 text-blue-600 rounded"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Notification Timing */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">⏰ When to Send Notifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700">📱 SMS Timing</h4>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={communicationSetup.reminderTiming.sms24h}
                      onChange={(e) => setCommunicationSetup({
                        ...communicationSetup,
                        reminderTiming: {
                          ...communicationSetup.reminderTiming,
                          sms24h: e.target.checked
                        }
                      })}
                      disabled={!communicationSetup.smsEnabled}
                      className="h-4 w-4 text-purple-600 rounded mr-3"
                    />
                    <span className={!communicationSetup.smsEnabled ? 'text-gray-400' : ''}>24-hour reminder</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={communicationSetup.reminderTiming.sms2h}
                      onChange={(e) => setCommunicationSetup({
                        ...communicationSetup,
                        reminderTiming: {
                          ...communicationSetup.reminderTiming,
                          sms2h: e.target.checked
                        }
                      })}
                      disabled={!communicationSetup.smsEnabled}
                      className="h-4 w-4 text-purple-600 rounded mr-3"
                    />
                    <span className={!communicationSetup.smsEnabled ? 'text-gray-400' : ''}>2-hour reminder</span>
                  </label>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700">📧 Email Timing</h4>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={communicationSetup.reminderTiming.emailConfirmation}
                      onChange={(e) => setCommunicationSetup({
                        ...communicationSetup,
                        reminderTiming: {
                          ...communicationSetup.reminderTiming,
                          emailConfirmation: e.target.checked
                        }
                      })}
                      disabled={!communicationSetup.emailEnabled}
                      className="h-4 w-4 text-purple-600 rounded mr-3"
                    />
                    <span className={!communicationSetup.emailEnabled ? 'text-gray-400' : ''}>Instant confirmation</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={communicationSetup.reminderTiming.email24h}
                      onChange={(e) => setCommunicationSetup({
                        ...communicationSetup,
                        reminderTiming: {
                          ...communicationSetup.reminderTiming,
                          email24h: e.target.checked
                        }
                      })}
                      disabled={!communicationSetup.emailEnabled}
                      className="h-4 w-4 text-purple-600 rounded mr-3"
                    />
                    <span className={!communicationSetup.emailEnabled ? 'text-gray-400' : ''}>24-hour reminder</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Notification Types */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">📋 What to Send</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div>
                    <span className="font-medium">✅ Booking Confirmations</span>
                    <p className="text-sm text-gray-600">When customer books an appointment</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={communicationSetup.notificationTypes.confirmations}
                    onChange={(e) => setCommunicationSetup({
                      ...communicationSetup,
                      notificationTypes: {
                        ...communicationSetup.notificationTypes,
                        confirmations: e.target.checked
                      }
                    })}
                    className="h-4 w-4 text-purple-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div>
                    <span className="font-medium">⏰ Appointment Reminders</span>
                    <p className="text-sm text-gray-600">24h and 2h before appointment</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={communicationSetup.notificationTypes.reminders}
                    onChange={(e) => setCommunicationSetup({
                      ...communicationSetup,
                      notificationTypes: {
                        ...communicationSetup.notificationTypes,
                        reminders: e.target.checked
                      }
                    })}
                    className="h-4 w-4 text-purple-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div>
                    <span className="font-medium">❌ Cancellation Notices</span>
                    <p className="text-sm text-gray-600">When appointments are cancelled</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={communicationSetup.notificationTypes.cancellations}
                    onChange={(e) => setCommunicationSetup({
                      ...communicationSetup,
                      notificationTypes: {
                        ...communicationSetup.notificationTypes,
                        cancellations: e.target.checked
                      }
                    })}
                    className="h-4 w-4 text-purple-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div>
                    <span className="font-medium">🎉 Promotional Messages</span>
                    <p className="text-sm text-gray-600">Special offers and campaigns</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={communicationSetup.notificationTypes.promotions}
                    onChange={(e) => setCommunicationSetup({
                      ...communicationSetup,
                      notificationTypes: {
                        ...communicationSetup.notificationTypes,
                        promotions: e.target.checked
                      }
                    })}
                    className="h-4 w-4 text-purple-600 rounded"
                  />
                </label>
              </div>
            </div>

            {/* Platform Info */}
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>✅ We handle the technical setup!</strong> You don't need any API keys or technical configuration. We send all notifications on your behalf using our platform.
              </p>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => {
                  const loyaltyStepId = getLoyaltyStepId()
                  const paymentStepId = getPaymentStepId()
                  const locationStepId = getLocationStepId()
                  
                  if (loyaltyStepId) {
                    setCurrentStep(loyaltyStepId)
                  } else if (paymentStepId) {
                    setCurrentStep(paymentStepId)
                  } else if (locationStepId) {
                    setCurrentStep(locationStepId)
                  } else {
                    setCurrentStep(5) // Business hours
                  }
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Back
              </button>
              <button
                onClick={() => {
                  const phoneStepId = getPhoneStepId()
                  if (phoneStepId) {
                    setCurrentStep(phoneStepId)
                  }
                }}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
              >
                Next Step
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* Phone Setup */}
        {currentStep === getPhoneStepId() && (
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
                <h3 className="font-semibold mb-4">📞 Keep Your Existing Number + Add AI</h3>
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
                  </div>

                  {/* AI Number Assignment */}
                  {assignedPhoneNumber && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-2">🤖 Your AI Number (We'll Handle This):</h4>
                      <div className="text-lg font-bold text-green-600 mb-2">
                        {VapiPhoneService.formatPhoneNumber(assignedPhoneNumber)}
                      </div>
                      <p className="text-sm text-green-700">
                        This is the number where your AI will receive forwarded calls
                      </p>
                    </div>
                  )}

                  {/* Carrier Forwarding Instructions */}
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-medium text-yellow-800 mb-2">📋 Simple Setup Instructions:</h4>
                    <div className="text-sm text-yellow-700 space-y-2">
                      <p><strong>1. Contact your phone carrier</strong> (Verizon, AT&T, etc.)</p>
                      <p><strong>2. Set up call forwarding rules:</strong></p>
                      <ul className="ml-4 space-y-1">
                        <li>• <strong>When busy:</strong> Forward to {assignedPhoneNumber || '[AI_NUMBER]'}</li>
                        <li>• <strong>When no answer (after 4-5 rings):</strong> Forward to {assignedPhoneNumber || '[AI_NUMBER]'}</li>
                        {phonePrefs.forwardAfterHours && <li>• <strong>After hours:</strong> Forward to {assignedPhoneNumber || '[AI_NUMBER]'}</li>}
                      </ul>
                      <p><strong>3. Test it:</strong> Call your number and let it ring - AI should answer</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Forwarding Options:</h4>
                    
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={phonePrefs.forwardAfterHours}
                        onChange={(e) => setPhonePrefs({ ...phonePrefs, forwardAfterHours: e.target.checked })}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="text-sm">Forward all after-hours calls to AI (Recommended)</span>
                    </label>
                    
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={phonePrefs.forwardComplexCalls}
                        onChange={(e) => setPhonePrefs({ ...phonePrefs, forwardComplexCalls: e.target.checked })}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="text-sm">Let AI try first, then forward if needed</span>
                    </label>
                  </div>

                  {/* Carrier Quick Links */}
                  <div className="p-3 bg-white border border-gray-200 rounded-lg">
                    <h5 className="font-medium text-gray-800 mb-2">📞 Carrier Support Numbers:</h5>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div>• Verizon: *72</div>
                      <div>• AT&T: *21*</div>
                      <div>• T-Mobile: **21*</div>
                      <div>• Sprint: *72</div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Call these codes + {assignedPhoneNumber || '[AI_NUMBER]'} + # to set up forwarding
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Booking Methods Information */}
            <div className="mt-6 p-6 bg-gray-50 border border-gray-200 rounded-xl">
              <h3 className="font-semibold mb-4">📞 Your Complete Booking Solution:</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 font-bold text-sm">📞</span>
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-gray-900">Voice/Call Booking</span>
                    <p className="text-sm text-gray-600">Customers can call and speak with AI to book appointments 24/7</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold text-sm">💻</span>
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-gray-900">Online/Web Booking</span>
                    <p className="text-sm text-gray-600">Customers can book directly from your website with our widget</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold text-sm">📱</span>
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-gray-900">SMS Confirmations</span>
                    <p className="text-sm text-gray-600">Automatic appointment reminders and confirmations sent via text</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 space-y-4">
                {/* Website Option */}
                <div className="border-2 border-gray-200 rounded-lg p-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={phonePrefs.webEnabled}
                      onChange={(e) => setPhonePrefs({ ...phonePrefs, webEnabled: e.target.checked })}
                      className="h-5 w-5 text-green-600 rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">💻 I have a website and want a booking widget</h4>
                      <p className="text-sm text-gray-600">Add our booking widget to your existing website</p>
                    </div>
                  </label>
                  
                  {phonePrefs.webEnabled && (
                    <div className="mt-4 ml-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h5 className="font-medium text-green-900 mb-2">Widget Features:</h5>
                      <div className="space-y-1 text-sm text-green-800 mb-3">
                        <div>• Mobile-friendly booking interface</div>
                        <div>• Real-time availability checking</div>
                        <div>• Automatic confirmation emails</div>
                        <div>• Matches your website design</div>
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
                
                {/* No Website Option */}
                <div className="border-2 border-blue-200 bg-blue-50 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-blue-600 font-bold text-sm">📱</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-blue-900 mb-2">Don't have a website? No problem!</h4>
                      <p className="text-sm text-blue-800 mb-3">
                        Your customers can book appointments directly through our customer portal - no website needed.
                      </p>
                      <div className="space-y-2 text-sm text-blue-700">
                        <div className="flex items-center space-x-2">
                          <CheckCircleIcon className="w-4 h-4 text-blue-600" />
                          <span>Customers use our mobile-friendly booking portal</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircleIcon className="w-4 h-4 text-blue-600" />
                          <span>Share your booking link on social media, business cards</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircleIcon className="w-4 h-4 text-blue-600" />
                          <span>QR codes for easy access in your salon</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircleIcon className="w-4 h-4 text-blue-600" />
                          <span>Customers can view their appointment history</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 p-3 bg-blue-100 rounded border border-blue-300">
                        <p className="text-sm text-blue-800">
                          <strong>💡 Pro tip:</strong> Most salons find that customers prefer calling or using the direct booking link over website widgets. You can always add a website widget later!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
                onClick={() => {
                  const communicationStepId = getCommunicationStepId()
                  if (communicationStepId) {
                    setCurrentStep(communicationStepId)
                  }
                }}
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

        {/* Complete Step */}
        {currentStep === getCompleteStepId() && (
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
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-medium text-yellow-800 mb-2">📋 Final Setup Step:</h4>
                    <div className="text-sm text-yellow-700 space-y-2">
                      <p><strong>Set up call forwarding with your carrier:</strong></p>
                      <div className="bg-yellow-100 p-3 rounded font-mono text-xs">
                        <p>• Call your carrier and say: "Set up call forwarding"</p>
                        <p>• Forward <strong>busy/no-answer</strong> calls to:</p>
                        <p className="font-bold text-yellow-900 text-base">{assignedPhoneNumber}</p>
                      </div>
                      <p className="text-xs">This typically takes 5-10 minutes with your carrier's support.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="bg-purple-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold mb-2">What's Ready:</h3>
              <ul className="text-left space-y-2 text-gray-700">
                <li>✅ Your dashboard is ready to use</li>
                <li>✅ Voice AI booking system is configured</li>
                <li>✅ Online booking widget is ready</li>
                <li>✅ SMS confirmations and reminders enabled</li>
                {assignedPhoneNumber ? (
                  <li>✅ Phone number assigned and ready for calls</li>
                ) : (
                  <li>⚠️ Phone number assignment pending (check with support)</li>
                )}
                <li>📊 Start accepting bookings 24/7!</li>
              </ul>
            </div>
            
            {/* Customer Booking Links */}
            {business?.id && (
              <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">🔗 Customer Booking Options:</h3>
                
                {/* Customer Portal Link (Always Available) */}
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-1">
                      📱 Customer Booking Portal:
                    </label>
                    <div className="bg-white border border-blue-200 rounded px-3 py-2 text-sm font-mono">
                      {typeof window !== 'undefined' ? `${window.location.origin}/customer/portal?business=${business.id}` : `https://yourdomain.com/customer/portal?business=${business.id}`}
                    </div>
                    <p className="text-xs text-blue-700 mt-1">
                      Share this link on social media, business cards, or anywhere customers can access it
                    </p>
                  </div>
                </div>

                {/* Website Widget (Only if enabled) */}
                {phonePrefs.webEnabled && (
                  <div className="border-t border-blue-200 pt-4">
                    <h4 className="text-md font-medium text-green-800 mb-3">💻 Website Widget:</h4>
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

                {!phonePrefs.webEnabled && (
                  <div className="border-t border-blue-200 pt-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 text-sm">💡</span>
                      </div>
                      <div>
                        <p className="text-sm text-blue-800">
                          <strong>No website needed!</strong> Your customers can book using the portal link above. 
                          You can add a website widget anytime from your dashboard settings.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Social Media Kit */}
            {business?.id && (
              <div className="mt-6">
                <SocialMediaKit
                  businessId={business.id}
                  businessName={business.name}
                  phoneNumber={assignedPhoneNumber || phonePrefs.existingNumber}
                  bookingUrl={typeof window !== 'undefined' ? `${window.location.origin}/customer/portal?business=${business.id}` : `https://yourdomain.com/customer/portal?business=${business.id}`}
                />
              </div>
            )}
            
            <div className="mt-8">
              <button
                onClick={() => router.push('/demo-dashboard')}
                className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-lg font-medium"
              >
                Go to Dashboard Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}