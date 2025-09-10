#!/usr/bin/env node

/**
 * Production Monitoring Setup Script
 * Sets up comprehensive error tracking and monitoring infrastructure
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🔧 Setting up Production Monitoring System...')
console.log('=' .repeat(60))

// Create monitoring utilities
const setupErrorBoundaries = () => {
  console.log('\n📋 Step 1: Setting up Error Boundaries...')
  
  const errorBoundaryCode = `'use client'

import React from 'react'
import { ErrorTracker, ErrorCategory, ErrorSeverity } from '../lib/error-tracking'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorId?: string
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; errorId: string; retry: () => void }>
  category?: string
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private errorTracker = ErrorTracker.getInstance()

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const errorId = Math.random().toString(36).substr(2, 9)
    return {
      hasError: true,
      error,
      errorId,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const errorId = this.state.errorId || 'unknown'
    
    // Track the error
    this.errorTracker.trackError(
      error,
      ErrorCategory.DASHBOARD,
      ErrorSeverity.HIGH,
      {
        errorId,
        component: this.props.category || 'unknown',
        errorInfo: errorInfo.componentStack,
        businessId: this.getBusinessId(),
      }
    )

    console.error('Error Boundary caught error:', error, errorInfo)
  }

  private getBusinessId(): string | undefined {
    if (typeof window === 'undefined') return undefined
    return localStorage.getItem('authenticated_business_id') || undefined
  }

  private retry = () => {
    this.setState({ hasError: false, error: undefined, errorId: undefined })
  }

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback } = this.props
      
      if (Fallback && this.state.error && this.state.errorId) {
        return <Fallback error={this.state.error} errorId={this.state.errorId} retry={this.retry} />
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md mx-auto text-center">
            <div className="w-16 h-16 mx-auto mb-4 text-red-500">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">
              We've been notified of this error. Please try refreshing the page.
            </p>
            <div className="space-x-4">
              <button
                onClick={this.retry}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Refresh Page
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-gray-600 hover:text-gray-900">
                  Error Details (Dev Only)
                </summary>
                <pre className="mt-2 p-4 bg-gray-100 rounded text-sm overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}`

  fs.writeFileSync(path.join(__dirname, 'components/ErrorBoundary.tsx'), errorBoundaryCode)
  console.log('✅ Created ErrorBoundary component')
}

// Create monitoring dashboard
const setupMonitoringDashboard = () => {
  console.log('\n📋 Step 2: Setting up Monitoring Dashboard...')
  
  const monitoringDashboardCode = `'use client'

import { useState, useEffect } from 'react'
import { 
  ExclamationTriangleIcon, 
  CheckCircleIcon,
  ClockIcon,
  CpuChipIcon,
  ServerIcon 
} from '@heroicons/react/24/outline'

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  responseTime: number
  checks: Record<string, any>
}

export default function MonitoringDashboard() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchHealthStatus = async () => {
    try {
      const response = await fetch('/api/monitoring/health')
      const data = await response.json()
      setHealthStatus(data)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to fetch health status:', error)
      setHealthStatus({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        responseTime: 0,
        checks: {
          api: { status: 'unhealthy', error: 'Failed to connect' }
        }
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHealthStatus()
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchHealthStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100'
      case 'degraded': return 'text-yellow-600 bg-yellow-100'
      case 'unhealthy': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircleIcon className="w-5 h-5" />
      case 'degraded': return <ExclamationTriangleIcon className="w-5 h-5" />
      case 'unhealthy': return <ExclamationTriangleIcon className="w-5 h-5" />
      default: return <ClockIcon className="w-5 h-5" />
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">System Status</h2>
          <button
            onClick={fetchHealthStatus}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Refresh
          </button>
        </div>

        {healthStatus && (
          <div className="space-y-4">
            <div className="flex items-center">
              <span className={\`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium \${getStatusColor(healthStatus.status)}\`}>
                {getStatusIcon(healthStatus.status)}
                <span className="ml-2 capitalize">{healthStatus.status}</span>
              </span>
              <span className="ml-4 text-sm text-gray-500">
                Response time: {healthStatus.responseTime}ms
              </span>
            </div>

            {lastUpdated && (
              <p className="text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Service Checks */}
      {healthStatus?.checks && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Health Checks</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(healthStatus.checks).map(([service, check]: [string, any]) => (
              <div key={service} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    {service === 'database' && <ServerIcon className="w-4 h-4 mr-2 text-gray-400" />}
                    {service === 'vapi' && <CpuChipIcon className="w-4 h-4 mr-2 text-gray-400" />}
                    {service === 'webhook' && <ServerIcon className="w-4 h-4 mr-2 text-gray-400" />}
                    <span className="font-medium text-gray-900 capitalize">{service}</span>
                  </div>
                  <span className={\`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium \${getStatusColor(check.status)}\`}>
                    {check.status}
                  </span>
                </div>

                {check.responseTime && (
                  <p className="text-sm text-gray-500">
                    Response time: {check.responseTime}ms
                  </p>
                )}

                {check.error && (
                  <p className="text-sm text-red-600 mt-1">
                    {check.error}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}`

  fs.writeFileSync(path.join(__dirname, 'components/MonitoringDashboard.tsx'), monitoringDashboardCode)
  console.log('✅ Created Monitoring Dashboard component')
}

// Add error tracking to critical API routes
const addErrorTrackingToAPIs = () => {
  console.log('\n📋 Step 3: Adding error tracking to API routes...')
  
  // Create API error wrapper
  const apiErrorWrapperCode = `import { NextRequest, NextResponse } from 'next/server'
import { trackAPIError, trackDatabaseError, trackVAPIError, ErrorContext } from '../../lib/error-tracking'

export interface APIErrorContext extends ErrorContext {
  method?: string
  endpoint?: string
  headers?: Record<string, string>
  query?: Record<string, string>
  body?: any
}

export function withErrorTracking<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>,
  endpoint: string
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const startTime = Date.now()
    
    try {
      const response = await handler(request, ...args)
      
      // Track successful API calls
      const responseTime = Date.now() - startTime
      if (responseTime > 2000) {
        // Track slow API calls
        console.warn(\`Slow API call: \${endpoint} took \${responseTime}ms\`)
      }
      
      return response
      
    } catch (error) {
      const responseTime = Date.now() - startTime
      
      // Create error context
      const context: APIErrorContext = {
        method: request.method,
        endpoint,
        url: request.url,
        headers: Object.fromEntries(request.headers.entries()),
        timestamp: new Date().toISOString(),
        responseTime,
      }
      
      // Add query parameters
      const url = new URL(request.url)
      if (url.searchParams.size > 0) {
        context.query = Object.fromEntries(url.searchParams.entries())
      }
      
      // Track the error
      if (error instanceof Error) {
        if (error.message.includes('database') || error.message.includes('postgres')) {
          trackDatabaseError(error, context)
        } else if (error.message.includes('vapi') || error.message.includes('assistant')) {
          trackVAPIError(error, context)
        } else {
          trackAPIError(error, endpoint, context)
        }
      }
      
      // Log the error
      console.error(\`API Error in \${endpoint}:\`, error)
      
      // Return error response
      return NextResponse.json(
        {
          error: 'Internal server error',
          message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      )
    }
  }
}

export default withErrorTracking`

  fs.writeFileSync(path.join(__dirname, 'lib/api-error-wrapper.ts'), apiErrorWrapperCode)
  console.log('✅ Created API error wrapper utility')
}

// Create monitoring configuration
const createMonitoringConfig = () => {
  console.log('\n📋 Step 4: Creating monitoring configuration...')
  
  const monitoringConfigCode = `/**
 * Production Monitoring Configuration
 * Centralized configuration for all monitoring features
 */

export const MONITORING_CONFIG = {
  // Feature toggles
  errorTracking: process.env.NODE_ENV === 'production',
  performanceMonitoring: process.env.NODE_ENV === 'production',
  healthChecks: true,
  userAnalytics: process.env.NODE_ENV === 'production',
  
  // Error thresholds
  criticalErrorThreshold: 5, // errors per minute
  warningThreshold: 10, // errors per hour
  slowQueryThreshold: 1000, // milliseconds
  slowPageLoadThreshold: 3000, // milliseconds
  
  // Monitoring intervals
  healthCheckInterval: 30000, // 30 seconds
  errorFlushInterval: 60000, // 1 minute
  performanceFlushInterval: 120000, // 2 minutes
  
  // External services
  sentry: {
    enabled: false, // Set to true when Sentry is configured
    dsn: process.env.SENTRY_DSN,
  },
  
  logRocket: {
    enabled: false, // Set to true when LogRocket is configured
    appId: process.env.LOGROCKET_APP_ID,
  },
  
  // Alert channels
  alerts: {
    email: {
      enabled: true,
      recipients: [
        process.env.ALERT_EMAIL || 'admin@example.com'
      ]
    },
    slack: {
      enabled: false, // Configure Slack webhook
      webhookUrl: process.env.SLACK_WEBHOOK_URL,
    },
    sms: {
      enabled: false, // Configure SMS alerts
      phoneNumbers: []
    }
  },
  
  // Dashboard features
  dashboard: {
    autoRefresh: true,
    refreshInterval: 30000,
    showDetailedErrors: process.env.NODE_ENV === 'development',
    maxErrorsToDisplay: 100,
  }
}

// Health check services configuration
export const HEALTH_CHECK_SERVICES = [
  {
    name: 'database',
    url: 'internal', // Special case for database check
    timeout: 5000,
    critical: true,
  },
  {
    name: 'webhook',
    url: process.env.RAILWAY_WEBHOOK_URL || 'https://web-production-60875.up.railway.app',
    timeout: 5000,
    critical: true,
  },
  {
    name: 'vapi',
    url: 'https://api.vapi.ai',
    timeout: 5000,
    critical: true,
  }
]

export default MONITORING_CONFIG`

  fs.writeFileSync(path.join(__dirname, 'lib/monitoring-config.ts'), monitoringConfigCode)
  console.log('✅ Created monitoring configuration')
}

// Main setup function
const setupProductionMonitoring = () => {
  try {
    console.log('\n🚀 Starting Production Monitoring Setup...')
    
    // Create directories if they don't exist
    const dirs = [
      path.join(__dirname, 'components'),
      path.join(__dirname, 'lib'),
      path.join(__dirname, 'app/api/monitoring'),
    ]
    
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
        console.log(\`📁 Created directory: \${dir}\`)
      }
    })
    
    // Run setup steps
    setupErrorBoundaries()
    setupMonitoringDashboard()
    addErrorTrackingToAPIs()
    createMonitoringConfig()
    
    console.log('\n✅ Production Monitoring Setup Complete!')
    console.log('=' .repeat(60))
    console.log('\n📋 Next Steps:')
    console.log('  1. Wrap your app with ErrorBoundary components')
    console.log('  2. Add MonitoringDashboard to admin pages')
    console.log('  3. Update API routes to use withErrorTracking')
    console.log('  4. Configure external monitoring services (Sentry, LogRocket)')
    console.log('  5. Set up alert channels (email, Slack)')
    console.log('')
    console.log('📊 Monitoring Endpoints Available:')
    console.log('  • GET /api/monitoring/health - System health check')
    console.log('  • POST /api/monitoring/errors - Error reporting')
    console.log('')
    console.log('🔧 Configuration files created:')
    console.log('  • lib/error-tracking.ts - Error tracking system')
    console.log('  • lib/monitoring-config.ts - Configuration settings')
    console.log('  • lib/api-error-wrapper.ts - API error handling')
    console.log('  • components/ErrorBoundary.tsx - React error boundaries')
    console.log('  • components/MonitoringDashboard.tsx - Admin monitoring')
    
  } catch (error) {
    console.error('❌ Setup failed:', error)
    process.exit(1)
  }
}

// Run setup
setupProductionMonitoring()`