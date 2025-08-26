'use client'

import { useRouter } from 'next/navigation'
import { 
  SparklesIcon,
  PhoneIcon,
  ChartBarIcon,
  UserGroupIcon,
  CalendarIcon,
  ArrowRightIcon,
  PlayIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline'

export default function LandingPage() {
  const router = useRouter()

  const features = [
    {
      icon: PhoneIcon,
      title: 'AI Voice Booking',
      description: 'Customers can call and book appointments 24/7 with our intelligent voice assistant'
    },
    {
      icon: CalendarIcon,
      title: 'Smart Scheduling',
      description: 'Automated appointment management with real-time availability checking'
    },
    {
      icon: UserGroupIcon,
      title: 'Staff Management',
      description: 'Track your team, manage schedules, and assign appointments efficiently'
    },
    {
      icon: ChartBarIcon,
      title: 'Business Analytics',
      description: 'Real-time insights into bookings, revenue, and customer trends'
    }
  ]

  const handleDemo = () => {
    // Go to the interactive demo experience
    router.push('/demo')
  }

  const handleDashboardDemo = () => {
    // Set the demo business ID and go to dashboard
    localStorage.setItem('demo_business_id', '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad')
    router.push('/demo-dashboard')
  }

  const handleOnboarding = () => {
    router.push('/onboarding')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <SparklesIcon className="h-8 w-8 text-purple-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Nail Salon Pro
              </span>
            </div>
            <nav className="flex items-center space-x-6">
              <button
                onClick={handleDemo}
                className="text-gray-700 hover:text-purple-600 transition"
              >
                View Demo
              </button>
              <button
                onClick={handleOnboarding}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                Get Started
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            The Complete AI-Powered
            <br />
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Nail Salon Management System
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Transform your nail salon with voice AI booking, smart scheduling, and comprehensive business management tools. 
            Let technology handle the bookings while you focus on creating beautiful nails.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleOnboarding}
              className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-semibold rounded-xl hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center justify-center"
            >
              <RocketLaunchIcon className="w-6 h-6 mr-2" />
              Start Your Free Setup
              <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition" />
            </button>
            
            <button
              onClick={handleDemo}
              className="group px-8 py-4 bg-white border-2 border-purple-600 text-purple-600 text-lg font-semibold rounded-xl hover:bg-purple-50 hover:shadow-lg transition-all transform hover:-translate-y-1 flex items-center justify-center"
            >
              <PlayIcon className="w-6 h-6 mr-2" />
              Start Interactive Demo
              <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition" />
            </button>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 mb-2">
              Or explore the salon management dashboard →
            </p>
            <button
              onClick={handleDashboardDemo}
              className="text-purple-600 hover:text-purple-700 underline text-sm font-medium"
            >
              View Demo Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Get Started in Minutes
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-purple-600">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Set Up Your Salon</h3>
            <p className="text-gray-600">Add your business info, services, staff, and hours in our simple wizard</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-purple-600">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Configure Voice AI</h3>
            <p className="text-gray-600">We'll set up your AI assistant to handle calls and bookings automatically</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-purple-600">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Start Taking Bookings</h3>
            <p className="text-gray-600">Share your number and let the AI handle appointments 24/7</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 py-16 mt-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Nail Salon?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join hundreds of salons using AI to streamline their booking process
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleOnboarding}
              className="px-8 py-4 bg-white text-purple-600 font-semibold rounded-xl hover:bg-gray-100 transition"
            >
              Set Up Your Salon Now
            </button>
            <button
              onClick={handleDemo}
              className="px-8 py-4 bg-purple-700 text-white font-semibold rounded-xl hover:bg-purple-800 transition"
            >
              Explore Demo First
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>© 2025 Nail Salon Pro. Powered by Vapi AI & Supabase.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}