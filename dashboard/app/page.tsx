'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { 
  SparklesIcon,
  PhoneIcon,
  ChartBarIcon,
  UserGroupIcon,
  CalendarIcon,
  ArrowRightIcon,
  CheckIcon,
  StarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  BoltIcon,
  ArrowTrendingUpIcon,
  ChatBubbleLeftRightIcon,
  GlobeAmericasIcon,
  HeartIcon,
  TrophyIcon,
  FireIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

export default function LandingPage() {
  const router = useRouter()

  const handleOnboarding = () => {
    router.push('/onboarding')
  }

  const handleDemo = () => {
    router.push('/demo')
  }

  const handleBusinessLogin = () => {
    router.push('/login')
  }

  const handleCustomerLogin = () => {
    router.push('/customer/login')
  }

  const testimonials = [
    {
      name: "Sarah Johnson",
      salon: "Glamour Nails NYC",
      rating: 5,
      image: "SJ",
      quote: "We went from missing 40% of calls to capturing every single booking opportunity. Revenue up 35% in 2 months!",
      highlight: "Revenue up 35%"
    },
    {
      name: "Michelle Kim",
      salon: "Luxury Spa & Nails",
      rating: 5,
      image: "MK",
      quote: "The AI handles bookings so naturally, clients don't even realize they're not talking to a human. Absolutely game-changing!",
      highlight: "5x more bookings"
    },
    {
      name: "Jessica Martinez",
      salon: "Bella Vista Salon",
      rating: 5,
      image: "JM",
      quote: "I finally have my evenings back! The system handles everything while I'm home with my family.",
      highlight: "Work-life balance restored"
    }
  ]

  const stats = [
    { number: "24/7", label: "Availability", icon: ClockIcon },
    { number: "2 min", label: "Setup Time", icon: BoltIcon },
    { number: "98%", label: "Customer Satisfaction", icon: HeartIcon },
    { number: "$0", label: "Upfront Cost", icon: CurrencyDollarIcon }
  ]

  const benefits = [
    {
      title: "Never Miss Another Booking",
      description: "AI answers instantly, 24/7. While competitors send calls to voicemail, you're booking appointments at 2 AM.",
      icon: PhoneIcon,
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Increase Revenue by 40%",
      description: "Capture after-hours bookings, reduce no-shows with smart reminders, and upsell services automatically.",
      icon: ArrowTrendingUpIcon,
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Save 20 Hours Per Week",
      description: "Stop playing phone tag. Your AI assistant handles all scheduling while you focus on your craft.",
      icon: ClockIcon,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Delight Your Customers",
      description: "Instant responses, perfect scheduling, and a professional experience that builds loyalty.",
      icon: StarIcon,
      color: "from-yellow-500 to-orange-500"
    }
  ]

  const comparisonPoints = [
    { us: "24/7 AI receptionist", them: "Voicemail after hours", winning: true },
    { us: "Instant booking confirmation", them: "Call back required", winning: true },
    { us: "Handles multiple calls", them: "One call at a time", winning: true },
    { us: "Smart upselling", them: "Missed revenue opportunities", winning: true },
    { us: "$97/month all-inclusive", them: "$2000+/month for receptionist", winning: true },
    { us: "Never sick, never late", them: "Staff availability issues", winning: true }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Announcement Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 text-center">
        <span className="font-semibold">✨ NEW: Free setup for early adopters</span>
        <span className="mx-2">•</span>
        <span className="text-sm">Join salons already using AI to grow their business</span>
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <SparklesIcon className="h-8 w-8 text-purple-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                NailBooker AI
              </span>
            </div>
            <nav className="flex items-center space-x-4">
              <button
                onClick={handleDemo}
                className="text-gray-700 hover:text-purple-600 transition font-medium"
              >
                Try Demo
              </button>
              <button
                onClick={handleBusinessLogin}
                className="text-gray-700 hover:text-purple-600 transition font-medium"
              >
                Business Login
              </button>
              <button
                onClick={handleCustomerLogin}
                className="text-gray-700 hover:text-purple-600 transition font-medium"
              >
                Customer Login
              </button>
              <button
                onClick={handleOnboarding}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:shadow-lg transition-all transform hover:scale-105 font-semibold"
              >
                Get Started
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Trust Badge */}
            <div className="inline-flex items-center bg-blue-50 text-blue-800 px-4 py-2 rounded-full mb-6">
              <ShieldCheckIcon className="w-5 h-5 mr-2" />
              <span className="text-sm font-semibold">Used by nail salons nationwide</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Your Salon is Losing
              <br />
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                $8,000/Month
              </span>
              <br />
              in Missed Bookings
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-700 mb-4 max-w-3xl mx-auto font-medium">
              60% of calls come after hours. Your competitors use AI to book them all.
            </p>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join smart salon owners who never miss a booking with our AI receptionist that sounds completely human.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button
                onClick={handleOnboarding}
                className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-bold rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 flex items-center justify-center"
              >
                <RocketLaunchIcon className="w-6 h-6 mr-2" />
                Start Free Trial
                <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition" />
              </button>
              
              <button
                onClick={handleDemo}
                className="group px-8 py-4 bg-white border-2 border-purple-200 text-purple-600 text-lg font-semibold rounded-full hover:bg-purple-50 hover:border-purple-300 transition-all flex items-center justify-center"
              >
                <PhoneIcon className="w-6 h-6 mr-2" />
                Hear AI Demo
              </button>
            </div>

            {/* Existing Users Login */}
            <div className="text-center mb-6">
              <p className="text-gray-600 text-sm mb-3">Already have an account?</p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <button
                  onClick={handleBusinessLogin}
                  className="px-4 py-2 text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition text-sm font-medium"
                >
                  Business Owner Login
                </button>
                <button
                  onClick={handleCustomerLogin}
                  className="px-4 py-2 text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition text-sm font-medium"
                >
                  Customer Portal
                </button>
              </div>
            </div>

            {/* Social Proof Pills */}
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center text-gray-600">
                <CheckIcon className="w-4 h-4 text-green-500 mr-1" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center text-gray-600">
                <CheckIcon className="w-4 h-4 text-green-500 mr-1" />
                <span>2-minute setup</span>
              </div>
              <div className="flex items-center text-gray-600">
                <CheckIcon className="w-4 h-4 text-green-500 mr-1" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 animate-bounce">
          <div className="bg-white rounded-lg shadow-lg p-3 transform rotate-3">
            <span className="text-2xl">💅</span>
          </div>
        </div>
        <div className="absolute bottom-20 right-10 animate-bounce delay-150">
          <div className="bg-white rounded-lg shadow-lg p-3 transform -rotate-3">
            <span className="text-2xl">📞</span>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white py-12 border-y">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-2">
                    <Icon className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{stat.number}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-red-600 font-semibold uppercase tracking-wide text-sm">The Problem</span>
              <h2 className="text-3xl font-bold mt-2 mb-6">You're Losing Money Every Single Day</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 mt-1">✕</div>
                  <div className="ml-3">
                    <p className="font-semibold">Missing 60% of calls</p>
                    <p className="text-gray-600 text-sm">After hours, during appointments, lunch breaks</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 mt-1">✕</div>
                  <div className="ml-3">
                    <p className="font-semibold">Customers go to competitors</p>
                    <p className="text-gray-600 text-sm">They won't leave voicemails, they just call the next salon</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 mt-1">✕</div>
                  <div className="ml-3">
                    <p className="font-semibold">Staff overwhelmed</p>
                    <p className="text-gray-600 text-sm">Juggling walk-ins while answering phones</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <span className="text-green-600 font-semibold uppercase tracking-wide text-sm">The Solution</span>
              <h2 className="text-3xl font-bold mt-2 mb-6">AI That Never Stops Booking</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 mt-1">✓</div>
                  <div className="ml-3">
                    <p className="font-semibold">Answers in 2 seconds, 24/7</p>
                    <p className="text-gray-600 text-sm">Never miss another opportunity</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 mt-1">✓</div>
                  <div className="ml-3">
                    <p className="font-semibold">Books while you sleep</p>
                    <p className="text-gray-600 text-sm">Wake up to a full calendar</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 mt-1">✓</div>
                  <div className="ml-3">
                    <p className="font-semibold">Handles unlimited calls</p>
                    <p className="text-gray-600 text-sm">Never put anyone on hold again</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Salon Owners <span className="text-purple-600">Love</span> The Results
            </h2>
            <p className="text-xl text-gray-600">See what early adopters are saying</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 relative">
                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-sm font-bold px-3 py-1 rounded-full">
                  {testimonial.highlight}
                </div>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.image}
                  </div>
                  <div className="ml-3">
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.salon}</div>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIconSolid key={i} className="w-5 h-5 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 italic">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Transform Your Salon in Minutes</h2>
            <p className="text-xl text-gray-600">Everything you need to 10x your bookings</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
                  <div className={`w-12 h-12 bg-gradient-to-r ${benefit.color} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Why We Win vs Traditional Methods</h2>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <div className="p-4"></div>
              <div className="p-4 text-center font-bold">NailBooker AI</div>
              <div className="p-4 text-center font-bold">Old Way</div>
            </div>
            {comparisonPoints.map((point, index) => (
              <div key={index} className="grid grid-cols-3 border-b border-purple-100">
                <div className="p-4 font-medium">{point.us}</div>
                <div className="p-4 text-center">
                  <CheckIcon className="w-6 h-6 text-green-500 mx-auto" />
                </div>
                <div className="p-4 text-center">
                  <span className="text-red-500">✕</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gradient-to-br from-purple-600 to-pink-600 text-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl mb-12 text-white/90">Choose the perfect plan to transform your salon</p>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <div className="bg-white rounded-3xl p-6 text-gray-900 relative transform hover:scale-105 transition-all">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2">Starter</h3>
                <div className="text-4xl font-bold mb-1">
                  $39<span className="text-lg text-gray-600">/month</span>
                </div>
                <p className="text-gray-600 text-sm">Perfect for getting started</p>
              </div>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center">
                  <CheckIcon className="w-4 h-4 text-green-500 mr-3" />
                  <span className="text-sm">Web Booking Widget</span>
                </div>
                <div className="flex items-center">
                  <CheckIcon className="w-4 h-4 text-green-500 mr-3" />
                  <span className="text-sm">SMS Reminders</span>
                </div>
                <div className="flex items-center">
                  <CheckIcon className="w-4 h-4 text-green-500 mr-3" />
                  <span className="text-sm">Customer Portal</span>
                </div>
                <div className="flex items-center">
                  <CheckIcon className="w-4 h-4 text-green-500 mr-3" />
                  <span className="text-sm">Smart Analytics</span>
                </div>
                <div className="flex items-center">
                  <CheckIcon className="w-4 h-4 text-green-500 mr-3" />
                  <span className="text-sm">Email Marketing</span>
                </div>
                <div className="flex items-center">
                  <CheckIcon className="w-4 h-4 text-green-500 mr-3" />
                  <span className="text-sm">Social Media Booking</span>
                </div>
              </div>
              
              <button
                onClick={handleOnboarding}
                className="w-full px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-full hover:bg-gray-300 transition-all"
              >
                Get Started
              </button>
            </div>

            {/* Professional Plan - Most Popular */}
            <div className="bg-white rounded-3xl p-6 text-gray-900 relative transform scale-105 border-4 border-yellow-400">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-1 rounded-full font-bold text-sm">
                  MOST POPULAR
                </span>
              </div>
              
              <div className="text-center mb-6 pt-2">
                <h3 className="text-xl font-bold mb-2">Professional</h3>
                <div className="text-4xl font-bold mb-1">
                  $127<span className="text-lg text-gray-600">/month</span>
                </div>
                <p className="text-gray-600 text-sm">Best value for most salons</p>
              </div>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center">
                  <CheckIcon className="w-4 h-4 text-green-500 mr-3" />
                  <span className="text-sm font-medium">24/7 Voice AI Receptionist</span>
                </div>
                <div className="flex items-center">
                  <CheckIcon className="w-4 h-4 text-green-500 mr-3" />
                  <span className="text-sm">Everything in Starter</span>
                </div>
                <div className="flex items-center">
                  <CheckIcon className="w-4 h-4 text-green-500 mr-3" />
                  <span className="text-sm">Online Payments</span>
                </div>
                <div className="flex items-center">
                  <CheckIcon className="w-4 h-4 text-green-500 mr-3" />
                  <span className="text-sm">Loyalty Program</span>
                </div>
                <div className="flex items-center">
                  <CheckIcon className="w-4 h-4 text-green-500 mr-3" />
                  <span className="text-sm">Advanced Reporting</span>
                </div>
                <div className="flex items-center">
                  <CheckIcon className="w-4 h-4 text-green-500 mr-3" />
                  <span className="text-sm">Unlimited Bookings</span>
                </div>
              </div>
              
              <button
                onClick={handleOnboarding}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                Start Free Trial
              </button>
            </div>

            {/* Business Plan */}
            <div className="bg-white rounded-3xl p-6 text-gray-900 relative transform hover:scale-105 transition-all">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2">Business</h3>
                <div className="text-4xl font-bold mb-1">
                  $247<span className="text-lg text-gray-600">/month</span>
                </div>
                <p className="text-gray-600 text-sm">For growing salon chains</p>
              </div>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center">
                  <CheckIcon className="w-4 h-4 text-green-500 mr-3" />
                  <span className="text-sm font-medium">Up to 3 Locations</span>
                </div>
                <div className="flex items-center">
                  <CheckIcon className="w-4 h-4 text-green-500 mr-3" />
                  <span className="text-sm">Everything in Professional</span>
                </div>
                <div className="flex items-center">
                  <CheckIcon className="w-4 h-4 text-green-500 mr-3" />
                  <span className="text-sm">Team Management</span>
                </div>
                <div className="flex items-center">
                  <CheckIcon className="w-4 h-4 text-green-500 mr-3" />
                  <span className="text-sm">Multi-Location Analytics</span>
                </div>
                <div className="flex items-center">
                  <CheckIcon className="w-4 h-4 text-green-500 mr-3" />
                  <span className="text-sm">Priority Support</span>
                </div>
                <div className="flex items-center">
                  <CheckIcon className="w-4 h-4 text-green-500 mr-3" />
                  <span className="text-sm">Custom Integrations</span>
                </div>
              </div>
              
              <button
                onClick={handleOnboarding}
                className="w-full px-6 py-3 bg-purple-600 text-white font-semibold rounded-full hover:bg-purple-700 transition-all"
              >
                Contact Sales
              </button>
            </div>
          </div>

          <div className="mt-12 text-center text-white/90">
            <p className="text-lg mb-4">All plans include:</p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center">
                <CheckIcon className="w-4 h-4 mr-2" />
                <span>7-day free trial</span>
              </div>
              <div className="flex items-center">
                <CheckIcon className="w-4 h-4 mr-2" />
                <span>No setup fees</span>
              </div>
              <div className="flex items-center">
                <CheckIcon className="w-4 h-4 mr-2" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center">
                <CheckIcon className="w-4 h-4 mr-2" />
                <span>Free migration help</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Common Questions</h2>
          
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-bold mb-2">How quickly can I get started?</h3>
              <p className="text-gray-600">Setup takes just 2 minutes. Add your services, hours, and phone number. Your AI receptionist starts working immediately.</p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-bold mb-2">Does the AI sound robotic?</h3>
              <p className="text-gray-600">Not at all! Our AI uses advanced voice technology that sounds completely natural. Most customers don't even realize they're talking to AI.</p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-bold mb-2">What if I need to change my schedule?</h3>
              <p className="text-gray-600">Update your availability anytime from your dashboard. Changes take effect instantly.</p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-bold mb-2">Can I try it before committing?</h3>
              <p className="text-gray-600">Absolutely! Start with our 7-day free trial. No credit card required. Plus, we offer a 30-day money-back guarantee.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-purple-50 via-pink-50 to-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Never Miss
            <span className="text-purple-600"> Another Booking?</span>
          </h2>
          <p className="text-xl text-gray-700 mb-8">
            Join forward-thinking salon owners who are already using AI to grow their business.
          </p>

          <button
            onClick={handleOnboarding}
            className="group px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xl font-bold rounded-full shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105"
          >
            Start Your Free Trial
            <ArrowRightIcon className="inline-block w-6 h-6 ml-2 group-hover:translate-x-2 transition" />
          </button>

          <p className="mt-6 text-sm text-gray-600">
            7-day free trial • No credit card required • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <SparklesIcon className="h-8 w-8 text-purple-400" />
                <span className="text-xl font-bold">NailBooker AI</span>
              </div>
              <p className="text-gray-400 text-sm">
                The smartest way to manage your nail salon bookings.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><button onClick={handleDemo} className="hover:text-white transition">Demo</button></li>
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Reviews</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition">Status</a></li>
                <li><a href="#" className="hover:text-white transition">API Docs</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
                <li><a href="#" className="hover:text-white transition">Partners</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm mb-4 md:mb-0">
                © 2025 NailBooker AI. All rights reserved.
              </p>
              <div className="flex space-x-6 text-gray-400 text-sm">
                <a href="#" className="hover:text-white transition">Privacy Policy</a>
                <a href="#" className="hover:text-white transition">Terms of Service</a>
                <a href="#" className="hover:text-white transition">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}