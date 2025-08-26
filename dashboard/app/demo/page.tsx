'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  PhoneIcon,
  ChatBubbleLeftIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PlayIcon,
  PauseIcon,
  StarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

type DemoScenario = 'busy-rush' | 'after-hours' | 'staff-sick' | null
type DemoStep = 'intro' | 'scenario-select' | 'playing' | 'results' | 'final-cta'

interface ScenarioConfig {
  id: string
  title: string
  icon: any
  description: string
  problem: string
  solution: string
  revenue: number
  timeframe: string
  urgencyLevel: 'high' | 'medium' | 'low'
}

const SCENARIOS: ScenarioConfig[] = [
  {
    id: 'busy-rush',
    title: 'Busy Friday Rush',
    icon: PhoneIcon,
    description: 'It\'s 2 PM on Friday, you\'re in the middle of a gel manicure, and the phone won\'t stop ringing.',
    problem: 'Without AI: 3 missed calls = $180 in lost revenue',
    solution: 'With AI: All calls answered, 3 appointments booked = $180 secured',
    revenue: 180,
    timeframe: '15 minutes',
    urgencyLevel: 'high'
  },
  {
    id: 'after-hours',
    title: 'Late Night Emergency',
    icon: ClockIcon,
    description: 'It\'s 11 PM and you\'re at home. A customer texts needing an emergency appointment for tomorrow\'s wedding.',
    problem: 'Without AI: Customer frustrated, books competitor = $85 lost',
    solution: 'With AI: Instant response, appointment booked = $85 + happy customer',
    revenue: 85,
    timeframe: '30 seconds',
    urgencyLevel: 'medium'
  },
  {
    id: 'staff-sick',
    title: 'Staff Sick Day Crisis',
    icon: ExclamationTriangleIcon,
    description: 'Your best technician calls in sick 30 minutes before her first appointment. You have 6 appointments to handle.',
    problem: 'Without AI: Chaos, angry customers, potential $420 in refunds',
    solution: 'With AI: Automatic rescheduling, happy customers, revenue saved',
    revenue: 420,
    timeframe: '5 minutes',
    urgencyLevel: 'high'
  }
]

export default function InteractiveDemoPage() {
  const [currentStep, setCurrentStep] = useState<DemoStep>('intro')
  const [selectedScenario, setSelectedScenario] = useState<DemoScenario>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [completedScenarios, setCompletedScenarios] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying && progress < 100) {
      interval = setInterval(() => {
        setProgress(prev => Math.min(prev + 2, 100))
      }, 100)
    } else if (progress >= 100 && isPlaying) {
      setIsPlaying(false)
      setCurrentStep('results')
    }
    return () => clearInterval(interval)
  }, [isPlaying, progress])

  const handleScenarioSelect = (scenarioId: string) => {
    setSelectedScenario(scenarioId as DemoScenario)
    setCurrentStep('playing')
    setProgress(0)
    setIsPlaying(true)
  }

  const completeScenario = () => {
    const scenario = SCENARIOS.find(s => s.id === selectedScenario)
    if (scenario && !completedScenarios.includes(scenario.id)) {
      setTotalRevenue(prev => prev + scenario.revenue)
      setCompletedScenarios(prev => [...prev, scenario.id])
    }
    
    if (completedScenarios.length >= 2) {
      setCurrentStep('final-cta')
    } else {
      setCurrentStep('scenario-select')
    }
    setSelectedScenario(null)
  }

  const currentScenario = SCENARIOS.find(s => s.id === selectedScenario)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Experience YOUR Salon with AI
          </h1>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto">
            Step into the shoes of a salon owner and see how AI transforms your daily challenges into revenue wins
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex justify-center items-center space-x-4 text-white">
            <div className={`flex items-center ${currentStep !== 'intro' ? 'text-green-400' : ''}`}>
              <CheckCircleIcon className="w-6 h-6 mr-2" />
              <span>Welcome</span>
            </div>
            <ArrowRightIcon className="w-5 h-5 text-purple-300" />
            <div className={`flex items-center ${completedScenarios.length > 0 ? 'text-green-400' : currentStep === 'scenario-select' || currentStep === 'playing' || currentStep === 'results' ? 'text-white' : 'text-purple-400'}`}>
              <PlayIcon className="w-6 h-6 mr-2" />
              <span>Experience ({completedScenarios.length}/3)</span>
            </div>
            <ArrowRightIcon className="w-5 h-5 text-purple-300" />
            <div className={`flex items-center ${currentStep === 'final-cta' ? 'text-green-400' : 'text-purple-400'}`}>
              <StarIcon className="w-6 h-6 mr-2" />
              <span>Get Started</span>
            </div>
          </div>
          
          {/* Revenue Counter */}
          {totalRevenue > 0 && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center px-6 py-3 bg-green-600 rounded-full text-white font-bold text-lg">
                <CurrencyDollarIcon className="w-6 h-6 mr-2" />
                Revenue Saved/Generated: ${totalRevenue.toLocaleString()}
              </div>
            </div>
          )}
        </div>

        {/* Intro Step */}
        {currentStep === 'intro' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <PhoneIcon className="w-10 h-10 text-purple-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to YOUR Salon Demo
              </h2>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                You're about to experience real scenarios that happen in salons every day. 
                See how AI booking transforms problems into profit, stress into success.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Real Problems</h3>
                  <p className="text-sm text-gray-600">Experience the daily challenges every salon owner faces</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <PlayIcon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Interactive Solutions</h3>
                  <p className="text-sm text-gray-600">Watch AI solve problems in real-time</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CurrencyDollarIcon className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Measure Impact</h3>
                  <p className="text-sm text-gray-600">See exactly how much revenue you could gain</p>
                </div>
              </div>

              <button
                onClick={() => setCurrentStep('scenario-select')}
                className="inline-flex items-center px-8 py-4 bg-purple-600 text-white font-bold text-lg rounded-full hover:bg-purple-700 transition-colors shadow-lg"
              >
                Start Demo Experience
                <ArrowRightIcon className="w-6 h-6 ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* Scenario Selection */}
        {currentStep === 'scenario-select' && (
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                Choose Your Challenge
              </h2>
              <p className="text-xl text-purple-200">
                Pick a scenario you've experienced in your salon
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {SCENARIOS.map((scenario) => {
                const Icon = scenario.icon
                const isCompleted = completedScenarios.includes(scenario.id)
                
                return (
                  <div
                    key={scenario.id}
                    className={`bg-white rounded-xl shadow-lg p-6 cursor-pointer transform transition-all duration-200 hover:scale-105 ${
                      isCompleted ? 'ring-2 ring-green-500 bg-green-50' : 'hover:shadow-xl'
                    }`}
                    onClick={() => !isCompleted && handleScenarioSelect(scenario.id)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        scenario.urgencyLevel === 'high' ? 'bg-red-100' :
                        scenario.urgencyLevel === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'
                      }`}>
                        <Icon className={`w-6 h-6 ${
                          scenario.urgencyLevel === 'high' ? 'text-red-600' :
                          scenario.urgencyLevel === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                        }`} />
                      </div>
                      {isCompleted && (
                        <CheckCircleIcon className="w-8 h-8 text-green-500" />
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {scenario.title}
                    </h3>
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                      {scenario.description}
                    </p>
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Potential Impact:</span>
                        <span className="font-bold text-green-600">${scenario.revenue}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm mt-1">
                        <span className="text-gray-500">Time to Resolve:</span>
                        <span className="font-medium">{scenario.timeframe}</span>
                      </div>
                    </div>

                    {!isCompleted && (
                      <button className="w-full mt-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
                        Experience This Scenario
                      </button>
                    )}
                  </div>
                )
              })}
            </div>

            {completedScenarios.length > 0 && (
              <div className="text-center mt-8">
                <button
                  onClick={() => setCurrentStep('final-cta')}
                  className="inline-flex items-center px-8 py-4 bg-green-600 text-white font-bold text-lg rounded-full hover:bg-green-700 transition-colors shadow-lg"
                >
                  See My Results & Get Started
                  <ArrowRightIcon className="w-6 h-6 ml-2" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Playing Scenario */}
        {currentStep === 'playing' && currentScenario && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-8 relative overflow-hidden">
              {/* Floating Notifications */}
              {progress >= 20 && progress < 80 && (
                <div className="absolute top-4 right-4 animate-bounce">
                  <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                    💡 AI Working!
                  </div>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {currentScenario.title}
                </h2>
                <p className="text-lg text-gray-600">
                  {currentScenario.description}
                </p>
                <div className="mt-4 text-sm text-purple-600 font-medium">
                  ⏱️ You are the salon owner experiencing this RIGHT NOW
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Scenario Progress</span>
                  <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-purple-600 to-green-600 h-3 rounded-full transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Scenario Content with Enhanced Visuals */}
              <div className="space-y-6">
                {progress < 30 && (
                  <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6 animate-pulse">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white font-bold">!</span>
                      </div>
                      <h3 className="font-bold text-red-800 text-lg">😰 CRISIS HAPPENING NOW</h3>
                    </div>
                    <p className="text-red-700 font-medium text-lg">{currentScenario.problem}</p>
                    <div className="mt-4 text-red-600 text-sm">
                      💔 This is costing you money and stressing you out...
                    </div>
                  </div>
                )}
                
                {progress >= 30 && progress < 70 && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white font-bold">AI</span>
                      </div>
                      <h3 className="font-bold text-blue-800 text-lg">🤖 AI ASSISTANT TO THE RESCUE</h3>
                    </div>
                    <p className="text-blue-700 font-medium">Your AI is handling this crisis automatically while you focus on your current client...</p>
                    <div className="mt-4 space-y-2">
                      {progress >= 35 && (
                        <div className="flex items-center text-blue-600">
                          <CheckCircleIcon className="w-5 h-5 mr-2" />
                          <span className="text-sm">📞 AI answered the call professionally</span>
                        </div>
                      )}
                      {progress >= 45 && (
                        <div className="flex items-center text-blue-600">
                          <CheckCircleIcon className="w-5 h-5 mr-2" />
                          <span className="text-sm">🗣️ Customer needs understood perfectly</span>
                        </div>
                      )}
                      {progress >= 55 && (
                        <div className="flex items-center text-blue-600">
                          <CheckCircleIcon className="w-5 h-5 mr-2" />
                          <span className="text-sm">📅 Checking availability in real-time</span>
                        </div>
                      )}
                      {progress >= 65 && (
                        <div className="flex items-center text-blue-600">
                          <CheckCircleIcon className="w-5 h-5 mr-2" />
                          <span className="text-sm">✅ Appointment booked and confirmed!</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {progress >= 70 && (
                  <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-6 transform scale-105 transition-transform">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white font-bold">✓</span>
                      </div>
                      <h3 className="font-bold text-green-800 text-lg">🎉 CRISIS SOLVED & MONEY MADE!</h3>
                    </div>
                    <p className="text-green-700 font-medium text-lg">{currentScenario.solution}</p>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-4 border border-green-200">
                        <div className="text-2xl font-bold text-green-600">${currentScenario.revenue}</div>
                        <div className="text-sm text-green-700">Revenue Secured</div>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-green-200">
                        <div className="text-2xl font-bold text-green-600">{currentScenario.timeframe}</div>
                        <div className="text-sm text-green-700">Time Saved</div>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-green-100 rounded-lg">
                      <div className="text-green-800 font-medium text-sm">
                        💡 <strong>The best part?</strong> This happened automatically while you focused on your current client. 
                        No stress, no interruption, just pure profit!
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Social Proof Floating Notifications */}
              {progress >= 40 && progress < 60 && (
                <div className="absolute bottom-4 left-4 max-w-xs">
                  <div className="bg-white border border-gray-200 shadow-lg rounded-lg p-3 text-sm">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                      <span className="text-gray-600">
                        <strong>Sarah in Miami</strong> just made $180 while doing a pedicure
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Controls */}
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-lg"
                  disabled={progress >= 100}
                >
                  {isPlaying ? (
                    <>
                      <PauseIcon className="w-5 h-5 mr-2" />
                      Pause Experience
                    </>
                  ) : progress >= 100 ? (
                    <>
                      <CheckCircleIcon className="w-5 h-5 mr-2" />
                      Experience Complete!
                    </>
                  ) : (
                    <>
                      <PlayIcon className="w-5 h-5 mr-2" />
                      Continue Experience
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results Step */}
        {currentStep === 'results' && currentScenario && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircleIcon className="w-10 h-10 text-green-600" />
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Scenario Complete!
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                You just experienced how AI transforms a daily challenge into a revenue win
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-green-50 rounded-lg p-6">
                  <CurrencyDollarIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-bold text-gray-900">${currentScenario.revenue}</h3>
                  <p className="text-sm text-gray-600">Revenue Impact</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-6">
                  <ClockIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-bold text-gray-900">{currentScenario.timeframe}</h3>
                  <p className="text-sm text-gray-600">Time Saved</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-6">
                  <StarIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-bold text-gray-900">100%</h3>
                  <p className="text-sm text-gray-600">Success Rate</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-bold text-blue-800 mb-2">🎯 Want to see your actual salon dashboard?</h4>
                  <p className="text-blue-700 text-sm mb-3">
                    Experience the exact interface you'd use daily - with realistic data showing your salon's success!
                  </p>
                  <a
                    href="/demo-dashboard"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors"
                  >
                    View Demo Dashboard
                    <ArrowRightIcon className="w-5 h-5 ml-2" />
                  </a>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={completeScenario}
                    className="px-8 py-4 bg-purple-600 text-white font-bold text-lg rounded-full hover:bg-purple-700 transition-colors"
                  >
                    {completedScenarios.length >= 2 ? 'See All Results' : 'Try Another Scenario'}
                  </button>
                  <button
                    onClick={() => router.push('/onboarding')}
                    className="px-8 py-4 bg-green-600 text-white font-bold text-lg rounded-full hover:bg-green-700 transition-colors"
                  >
                    Start My Free Trial
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Final CTA */}
        {currentStep === 'final-cta' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-8 text-center relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-transparent rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-100 to-transparent rounded-full -ml-12 -mb-12"></div>
              
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">🚀</span>
                </div>
                
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  You've Experienced the Future of Salon Management
                </h2>
                <p className="text-xl text-gray-600 mb-4">
                  In just minutes, you saw how AI can save <span className="font-bold text-green-600">${totalRevenue.toLocaleString()}</span> and eliminate daily stress.
                </p>
                <p className="text-lg text-purple-600 font-medium mb-8">
                  💡 Now imagine this working <strong>24/7 for YOUR business</strong> while you focus on what you love!
                </p>

                <div className="bg-gradient-to-r from-purple-50 to-green-50 rounded-xl p-6 mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Your Demo Results:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-3xl font-bold text-purple-600">{completedScenarios.length}</div>
                      <div className="text-gray-600">Scenarios Experienced</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-green-600">${totalRevenue.toLocaleString()}</div>
                      <div className="text-gray-600">Revenue Impact Seen</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-blue-600">24/7</div>
                      <div className="text-gray-600">AI Working for You</div>
                    </div>
                  </div>
                </div>

                {/* Social Proof */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-center mb-2">
                    <div className="flex">
                      {[1,2,3,4,5].map(i => (
                        <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <span className="ml-2 font-medium text-gray-700">5.0 from 200+ salons</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    <strong>"This system paid for itself in the first week!"</strong> - Maria S., Glamour Nails
                  </p>
                </div>

                {/* Dashboard CTA */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mb-8">
                  <h4 className="text-xl font-bold text-blue-800 mb-2">🎯 Before You Decide...</h4>
                  <p className="text-blue-700 mb-4">
                    See exactly what YOUR salon's dashboard would look like with real appointment data, revenue tracking, and AI activity logs.
                  </p>
                  <a
                    href="/demo-dashboard"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition-colors shadow-lg"
                  >
                    View Your Future Dashboard
                    <ArrowRightIcon className="w-5 h-5 ml-2" />
                  </a>
                </div>

                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl">
                    <div className="text-lg font-bold mb-2">🎉 Limited Time: Start FREE Today!</div>
                    <div className="text-green-100 text-sm mb-4">
                      Join 500+ salons already using AI booking • No setup fees • Cancel anytime
                    </div>
                    <button
                      onClick={() => router.push('/onboarding')}
                      className="w-full sm:w-auto inline-flex items-center px-12 py-4 bg-white text-green-600 font-bold text-xl rounded-full hover:bg-green-50 transition-colors shadow-lg"
                    >
                      Start My 14-Day Free Trial
                      <ArrowRightIcon className="w-6 h-6 ml-2" />
                    </button>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    ✅ No credit card required  •  ✅ Setup in 5 minutes  •  ✅ Cancel anytime  •  ✅ Keep your current phone number
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t flex justify-center space-x-6">
                  <button
                    onClick={() => setCurrentStep('scenario-select')}
                    className="text-purple-600 hover:text-purple-700 font-medium"
                  >
                    ← Try More Scenarios
                  </button>
                  <span className="text-gray-300">|</span>
                  <a
                    href="/demo-dashboard"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View Demo Dashboard →
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}