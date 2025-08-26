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
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {currentScenario.title}
                </h2>
                <p className="text-lg text-gray-600">
                  {currentScenario.description}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Scenario Progress</span>
                  <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-purple-600 h-3 rounded-full transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Scenario Content */}
              <div className="space-y-6">
                {progress < 30 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h3 className="font-bold text-red-800 mb-2">😰 The Problem</h3>
                    <p className="text-red-700">{currentScenario.problem}</p>
                  </div>
                )}
                
                {progress >= 30 && progress < 70 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="font-bold text-blue-800 mb-2">🤖 AI Takes Action</h3>
                    <p className="text-blue-700">Your AI assistant is handling this situation automatically...</p>
                    <div className="mt-4 flex items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                      <span className="text-sm text-blue-600">Processing customer requests...</span>
                    </div>
                  </div>
                )}
                
                {progress >= 70 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h3 className="font-bold text-green-800 mb-2">✅ Success!</h3>
                    <p className="text-green-700">{currentScenario.solution}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm text-green-600">Revenue secured: <strong>${currentScenario.revenue}</strong></span>
                      <span className="text-sm text-green-600">Time saved: <strong>{currentScenario.timeframe}</strong></span>
                    </div>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  disabled={progress >= 100}
                >
                  {isPlaying ? (
                    <>
                      <PauseIcon className="w-5 h-5 mr-2" />
                      Pause Demo
                    </>
                  ) : progress >= 100 ? (
                    <>
                      <CheckCircleIcon className="w-5 h-5 mr-2" />
                      Complete!
                    </>
                  ) : (
                    <>
                      <PlayIcon className="w-5 h-5 mr-2" />
                      Resume Demo
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
        )}

        {/* Final CTA */}
        {currentStep === 'final-cta' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Ready to Transform YOUR Salon?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                You've seen how AI booking can save ${totalRevenue.toLocaleString()} and eliminate daily stress. 
                <br />Now imagine this working 24/7 for YOUR business.
              </p>

              <div className="bg-gradient-to-r from-purple-50 to-green-50 rounded-xl p-6 mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Your Demo Results:</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-bold text-purple-600">{completedScenarios.length}</div>
                    <div className="text-gray-600">Scenarios Completed</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-600">${totalRevenue.toLocaleString()}</div>
                    <div className="text-gray-600">Revenue Impact</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-600">24/7</div>
                    <div className="text-gray-600">AI Availability</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => router.push('/onboarding')}
                  className="w-full sm:w-auto inline-flex items-center px-12 py-5 bg-green-600 text-white font-bold text-xl rounded-full hover:bg-green-700 transition-colors shadow-lg"
                >
                  Start My 14-Day Free Trial
                  <ArrowRightIcon className="w-6 h-6 ml-2" />
                </button>
                <div className="text-sm text-gray-500">
                  ✅ No credit card required  •  ✅ Setup in 5 minutes  •  ✅ Cancel anytime
                </div>
              </div>

              <div className="mt-8 pt-8 border-t">
                <button
                  onClick={() => setCurrentStep('scenario-select')}
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  ← Try More Scenarios
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}