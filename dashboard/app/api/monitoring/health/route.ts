import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  const healthCheck = {
    status: 'healthy' as 'healthy' | 'degraded' | 'unhealthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'unknown',
    checks: {} as Record<string, any>,
    responseTime: 0,
  }

  try {
    // Check database connectivity
    const dbStartTime = Date.now()
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('id')
        .limit(1)

      const dbResponseTime = Date.now() - dbStartTime

      if (error) {
        healthCheck.checks.database = {
          status: 'unhealthy',
          error: error.message,
          responseTime: dbResponseTime,
        }
        healthCheck.status = 'unhealthy'
      } else {
        healthCheck.checks.database = {
          status: 'healthy',
          responseTime: dbResponseTime,
        }
      }
    } catch (dbError) {
      healthCheck.checks.database = {
        status: 'unhealthy',
        error: dbError instanceof Error ? dbError.message : 'Database connection failed',
        responseTime: Date.now() - dbStartTime,
      }
      healthCheck.status = 'unhealthy'
    }

    // Check webhook server (Railway)
    const webhookStartTime = Date.now()
    try {
      const webhookUrl = process.env.RAILWAY_WEBHOOK_URL || 'https://web-production-60875.up.railway.app'
      const response = await fetch(`${webhookUrl}/health`, {
        method: 'GET',
        timeout: 5000,
      })
      
      const webhookResponseTime = Date.now() - webhookStartTime

      if (response.ok) {
        healthCheck.checks.webhook = {
          status: 'healthy',
          responseTime: webhookResponseTime,
        }
      } else {
        healthCheck.checks.webhook = {
          status: 'degraded',
          error: `HTTP ${response.status}`,
          responseTime: webhookResponseTime,
        }
        if (healthCheck.status === 'healthy') {
          healthCheck.status = 'degraded'
        }
      }
    } catch (webhookError) {
      healthCheck.checks.webhook = {
        status: 'unhealthy',
        error: webhookError instanceof Error ? webhookError.message : 'Webhook server unavailable',
        responseTime: Date.now() - webhookStartTime,
      }
      healthCheck.status = 'unhealthy'
    }

    // Check VAPI service
    const vapiStartTime = Date.now()
    try {
      if (process.env.VAPI_API_KEY) {
        const response = await fetch('https://api.vapi.ai/assistant', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
          },
          timeout: 5000,
        })
        
        const vapiResponseTime = Date.now() - vapiStartTime

        if (response.ok) {
          healthCheck.checks.vapi = {
            status: 'healthy',
            responseTime: vapiResponseTime,
          }
        } else {
          healthCheck.checks.vapi = {
            status: 'degraded',
            error: `HTTP ${response.status}`,
            responseTime: vapiResponseTime,
          }
          if (healthCheck.status === 'healthy') {
            healthCheck.status = 'degraded'
          }
        }
      } else {
        healthCheck.checks.vapi = {
          status: 'degraded',
          error: 'VAPI API key not configured',
        }
        if (healthCheck.status === 'healthy') {
          healthCheck.status = 'degraded'
        }
      }
    } catch (vapiError) {
      healthCheck.checks.vapi = {
        status: 'unhealthy',
        error: vapiError instanceof Error ? vapiError.message : 'VAPI service unavailable',
        responseTime: Date.now() - vapiStartTime,
      }
      healthCheck.status = 'unhealthy'
    }

    // Check environment variables
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY',
      'VAPI_API_KEY',
      'STRIPE_SECRET_KEY',
    ]

    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName])
    
    healthCheck.checks.environment = {
      status: missingEnvVars.length === 0 ? 'healthy' : 'degraded',
      missingVariables: missingEnvVars,
      totalRequired: requiredEnvVars.length,
      available: requiredEnvVars.length - missingEnvVars.length,
    }

    if (missingEnvVars.length > 0 && healthCheck.status === 'healthy') {
      healthCheck.status = 'degraded'
    }

    // Memory usage check
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const memUsage = process.memoryUsage()
      const memoryMB = {
        rss: Math.round(memUsage.rss / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024),
      }

      healthCheck.checks.memory = {
        status: memoryMB.heapUsed > 500 ? 'degraded' : 'healthy',
        usage: memoryMB,
      }
    }

    // Calculate total response time
    healthCheck.responseTime = Date.now() - startTime

    // Determine HTTP status code based on health
    let statusCode = 200
    if (healthCheck.status === 'degraded') {
      statusCode = 200 // Still OK, but with warnings
    } else if (healthCheck.status === 'unhealthy') {
      statusCode = 503 // Service unavailable
    }

    return NextResponse.json(healthCheck, { status: statusCode })

  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Health check failed',
        responseTime: Date.now() - startTime,
      },
      { status: 503 }
    )
  }
}