'use client'

import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import {
  CalendarIcon,
  UsersIcon,
  CogIcon,
  HomeIcon,
  Bars3Icon,
  XMarkIcon,
  ChartBarIcon,
  WrenchScrewdriverIcon,
  PhoneIcon,
  CurrencyDollarIcon,
  BuildingStorefrontIcon,
  CreditCardIcon,
  GiftIcon,
  EnvelopeIcon,
  HeartIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'
import MobileNavigation from './MobileNavigation'

// Base navigation items (available to all plans)
const baseNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Appointments', href: '/dashboard/appointments', icon: CalendarIcon },
  { name: 'Customers', href: '/dashboard/customers', icon: UsersIcon },
  { name: 'Staff', href: '/dashboard/staff', icon: UsersIcon },
  { name: 'Services', href: '/dashboard/services', icon: WrenchScrewdriverIcon },
  { name: 'Analytics', href: '/dashboard/analytics', icon: ChartBarIcon },
  { name: 'Voice AI', href: '/dashboard/voice-ai', icon: PhoneIcon },
  { name: 'Agent Config', href: '/dashboard/agent', icon: SparklesIcon },
  { name: 'Settings', href: '/dashboard/settings', icon: CogIcon },
]

// Professional+ features
const professionalFeatures = [
  { name: 'Payments', href: '/dashboard/payments', icon: CreditCardIcon },
  { name: 'Loyalty Program', href: '/dashboard/loyalty', icon: HeartIcon },
  { name: 'Email Marketing', href: '/dashboard/marketing', icon: EnvelopeIcon },
]

// Business+ features
const businessFeatures = [
  { name: 'Locations', href: '/dashboard/locations', icon: BuildingStorefrontIcon },
]

// Function to get navigation based on plan tier
const getNavigationForPlan = (subscriptionTier: string) => {
  let navigation = [...baseNavigation]
  
  // Add professional features for Professional+ plans
  if (['professional', 'business', 'enterprise'].includes(subscriptionTier)) {
    // Insert professional features before Settings
    const settingsIndex = navigation.findIndex(item => item.name === 'Settings')
    navigation.splice(settingsIndex, 0, ...professionalFeatures)
  }
  
  // Add business features for Business+ plans
  if (['business', 'enterprise'].includes(subscriptionTier)) {
    // Insert business features before Professional features
    const paymentsIndex = navigation.findIndex(item => item.name === 'Payments')
    if (paymentsIndex !== -1) {
      navigation.splice(paymentsIndex, 0, ...businessFeatures)
    } else {
      // If no professional features, add before Settings
      const settingsIndex = navigation.findIndex(item => item.name === 'Settings')
      navigation.splice(settingsIndex, 0, ...businessFeatures)
    }
  }
  
  return navigation
}

interface LayoutProps {
  children: React.ReactNode
  business?: {
    name: string
    subscription_tier: string
  }
}

export default function Layout({ children, business }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile sidebar */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-40 md:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </Transition.Child>

          <div className="fixed inset-0 flex z-40">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute top-0 right-0 -mr-12 pt-2">
                    <button
                      type="button"
                      className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                  <SidebarContent business={business} />
                </div>
              </Dialog.Panel>
            </Transition.Child>
            <div className="flex-shrink-0 w-14" aria-hidden="true"></div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-white shadow-lg">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <SidebarContent business={business} />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top bar */}
        <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        {/* Page content */}
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none custom-scrollbar">
          {children}
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation 
        businessPlan={business?.subscription_tier as 'starter' | 'professional' | 'business'}
        businessName={business?.name}
      />
    </div>
  )
}

function SidebarContent({ business }: { business?: LayoutProps['business'] }) {
  const pathname = usePathname()
  const navigation = getNavigationForPlan(business?.subscription_tier || 'starter')

  return (
    <>
      {/* Logo and business info */}
      <div className="flex items-center flex-shrink-0 px-4">
        <div className="flex flex-col">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-gradient-to-br from-beauty-500 to-brand-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">✨</span>
            </div>
            <div className="ml-3">
              <h1 className="text-lg font-semibold text-gray-900">DropFly</h1>
            </div>
          </div>
          {business && (
            <div className="mt-2">
              <p className="text-sm font-medium text-gray-900 truncate">{business.name}</p>
              <div className="flex items-center gap-2">
                <p className="text-xs text-gray-500 capitalize">{business.subscription_tier} Plan</p>
                {getPlanBadge(business.subscription_tier)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-8 flex-1 px-2 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const isUpgradeRequired = isFeatureUpgradeRequired(item.name, business?.subscription_tier || 'starter')
          
          return (
            <Link
              key={item.name}
              href={isUpgradeRequired ? '/dashboard/settings?tab=billing' : item.href}
              className={clsx(
                'nav-item group',
                isActive ? 'nav-item-active' : 'nav-item-inactive',
                isUpgradeRequired ? 'opacity-60' : ''
              )}
            >
              <item.icon className="mr-3 h-5 w-5" aria-hidden="true" />
              {item.name}
              {isUpgradeRequired && (
                <span className="ml-auto text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 rounded-full group-hover:scale-105 transition-transform">
                  Pro
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Upgrade prompts based on plan */}
      {getUpgradePrompt(business?.subscription_tier || 'starter')}
    </>
  )
}

// Helper function to determine if feature requires upgrade
function isFeatureUpgradeRequired(featureName: string, subscriptionTier: string): boolean {
  // Features that require Professional tier or higher
  const professionalFeatures = ['Analytics', 'Payments', 'Loyalty Program', 'Marketing']
  
  // Features that require Business tier or higher  
  const businessFeatures = ['Locations']
  
  // Check Professional features (not available in Starter)
  if (professionalFeatures.includes(featureName)) {
    return subscriptionTier === 'starter'
  }
  
  // Check Business features (not available in Starter or Professional)
  if (businessFeatures.includes(featureName)) {
    return !['business', 'enterprise'].includes(subscriptionTier)
  }
  
  return false
}

// Helper function to get plan badge
function getPlanBadge(subscriptionTier: string) {
  const badges = {
    starter: <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">AI Starter</span>,
    professional: <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">AI Pro</span>,
    business: <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">AI Business</span>,
    enterprise: <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Enterprise</span>
  }
  return badges[subscriptionTier as keyof typeof badges] || null
}

// Helper function to get upgrade prompt based on plan
function getUpgradePrompt(subscriptionTier: string) {
  if (subscriptionTier === 'starter') {
    return (
      <div className="flex-shrink-0 p-4">
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg p-4 text-white">
          <h3 className="text-sm font-medium">Unlock Analytics & More</h3>
          <p className="text-xs mt-1 opacity-90">
            Upgrade to AI Professional for unlimited appointments, analytics & loyalty
          </p>
          <Link href="/dashboard/settings?tab=billing">
            <button className="mt-2 bg-white text-purple-600 text-xs font-medium px-3 py-1 rounded hover:bg-gray-100 transition-colors">
              Upgrade to Pro - $147/mo
            </button>
          </Link>
        </div>
      </div>
    )
  }
  
  if (subscriptionTier === 'professional') {
    return (
      <div className="flex-shrink-0 p-4">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-4 text-white">
          <h3 className="text-sm font-medium">Get Custom AI & Scale</h3>
          <p className="text-xs mt-1 opacity-90">
            Upgrade to AI Business for custom assistant & multi-location
          </p>
          <Link href="/dashboard/settings?tab=billing">
            <button className="mt-2 bg-white text-green-600 text-xs font-medium px-3 py-1 rounded hover:bg-gray-100 transition-colors">
              Upgrade to Business - $297/mo
            </button>
          </Link>
        </div>
      </div>
    )
  }
  
  return null
}