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
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Appointments', href: '/dashboard/appointments', icon: CalendarIcon },
  { name: 'Customers', href: '/dashboard/customers', icon: UsersIcon },
  { name: 'Staff', href: '/dashboard/staff', icon: UsersIcon },
  { name: 'Services', href: '/dashboard/services', icon: WrenchScrewdriverIcon },
  { name: 'Analytics', href: '/dashboard/analytics', icon: ChartBarIcon },
  { name: 'Voice AI', href: '/dashboard/voice-ai', icon: PhoneIcon },
  { name: 'Billing', href: '/dashboard/billing', icon: CurrencyDollarIcon },
  { name: 'Settings', href: '/dashboard/settings', icon: CogIcon },
]

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
                  <SidebarContent />
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
    </div>
  )
}

function SidebarContent({ business }: { business?: LayoutProps['business'] }) {
  const pathname = usePathname()

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
              <p className="text-xs text-gray-500 capitalize">{business.subscription_tier} Plan</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-8 flex-1 px-2 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'nav-item',
                isActive ? 'nav-item-active' : 'nav-item-inactive'
              )}
            >
              <item.icon className="mr-3 h-5 w-5" aria-hidden="true" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Upgrade prompt for starter plan */}
      {business?.subscription_tier === 'starter' && (
        <div className="flex-shrink-0 p-4">
          <div className="bg-gradient-to-r from-beauty-500 to-brand-600 rounded-lg p-4 text-white">
            <h3 className="text-sm font-medium">Upgrade to Pro</h3>
            <p className="text-xs mt-1 opacity-90">
              Get advanced analytics and marketing tools
            </p>
            <button className="mt-2 bg-white text-brand-600 text-xs font-medium px-3 py-1 rounded">
              Upgrade
            </button>
          </div>
        </div>
      )}
    </>
  )
}