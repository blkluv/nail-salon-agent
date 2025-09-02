import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const DEMO_BUSINESS_ID = '00000000-0000-0000-0000-000000000000'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const testType = searchParams.get('test') || 'all'
    
    const results: any = {
      timestamp: new Date().toISOString(),
      testType,
      results: {}
    }
    
    // Test 1: Branding System Integration
    if (testType === 'all' || testType === 'branding') {
      try {
        const { data: business, error } = await supabase
          .from('businesses')
          .select('id, name, branding, subscription_tier')
          .eq('id', DEMO_BUSINESS_ID)
          .single()
        
        results.results.branding = {
          success: !error && business,
          data: business,
          hasBranding: business?.branding && Object.keys(business.branding).length > 0,
          details: error ? error.message : 'Business branding data accessible'
        }
      } catch (error) {
        results.results.branding = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }
    
    // Test 2: Multi-Location System
    if (testType === 'all' || testType === 'locations') {
      try {
        const { data: locations, error } = await supabase
          .from('locations')
          .select('id, name, business_id, is_active')
          .eq('business_id', DEMO_BUSINESS_ID)
        
        results.results.locations = {
          success: !error,
          count: locations?.length || 0,
          data: locations?.slice(0, 3), // Show first 3 locations
          details: error ? error.message : `Found ${locations?.length || 0} locations`
        }
      } catch (error) {
        results.results.locations = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }
    
    // Test 3: Analytics Integration
    if (testType === 'all' || testType === 'analytics') {
      try {
        const { data: appointments, error } = await supabase
          .from('appointments')
          .select('id, total_amount, appointment_date, status, location_id')
          .eq('business_id', DEMO_BUSINESS_ID)
          .order('appointment_date', { ascending: false })
          .limit(10)
        
        const totalRevenue = appointments?.reduce((sum, apt) => 
          sum + (parseFloat(apt.total_amount) || 0), 0) || 0
        
        results.results.analytics = {
          success: !error,
          appointmentCount: appointments?.length || 0,
          totalRevenue,
          averageTicket: appointments?.length ? totalRevenue / appointments.length : 0,
          recentAppointments: appointments?.slice(0, 3),
          details: error ? error.message : 'Analytics data accessible for reporting'
        }
      } catch (error) {
        results.results.analytics = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }
    
    // Test 4: White-Label Configuration
    if (testType === 'all' || testType === 'whitelabel') {
      try {
        // Test white-label function (will return null for demo business)
        const { data, error } = await supabase
          .rpc('get_white_label_config', { p_domain: 'test-domain.com' })
        
        results.results.whitelabel = {
          success: !error, // Function exists and can be called
          functionExists: true,
          testResult: data,
          details: 'White-label system functions operational'
        }
      } catch (error) {
        results.results.whitelabel = {
          success: false,
          functionExists: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }
    
    // Test 5: Database Schema Validation
    if (testType === 'all' || testType === 'schema') {
      try {
        const tables = [
          'businesses',
          'locations', 
          'location_staff',
          'white_label_domains',
          'white_label_themes',
          'white_label_reports'
        ]
        
        const schemaResults = {}
        
        for (const table of tables) {
          try {
            const { data, error } = await supabase
              .from(table)
              .select('*')
              .limit(1)
            
            schemaResults[table] = {
              exists: !error,
              accessible: !error,
              error: error?.message
            }
          } catch (error) {
            schemaResults[table] = {
              exists: false,
              accessible: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            }
          }
        }
        
        results.results.schema = {
          success: Object.values(schemaResults).every((r: any) => r.exists),
          tables: schemaResults,
          details: 'Database schema validation completed'
        }
      } catch (error) {
        results.results.schema = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }
    
    // Test 6: Integration Health Check
    if (testType === 'all' || testType === 'health') {
      const healthChecks = {
        database: false,
        branding: false,
        locations: false,
        analytics: false
      }
      
      try {
        // Database health
        const { error: dbError } = await supabase
          .from('businesses')
          .select('id')
          .eq('id', DEMO_BUSINESS_ID)
          .single()
        healthChecks.database = !dbError
        
        // Branding system health
        const { data: brandingData } = await supabase
          .from('businesses')
          .select('branding')
          .eq('id', DEMO_BUSINESS_ID)
          .single()
        healthChecks.branding = brandingData?.branding !== null
        
        // Locations system health
        const { error: locError } = await supabase
          .from('locations')
          .select('id')
          .eq('business_id', DEMO_BUSINESS_ID)
          .limit(1)
        healthChecks.locations = !locError
        
        // Analytics system health  
        const { error: analyticsError } = await supabase
          .from('appointments')
          .select('id')
          .eq('business_id', DEMO_BUSINESS_ID)
          .limit(1)
        healthChecks.analytics = !analyticsError
        
        results.results.health = {
          success: Object.values(healthChecks).every(Boolean),
          checks: healthChecks,
          overallStatus: Object.values(healthChecks).every(Boolean) ? 'HEALTHY' : 'ISSUES_DETECTED',
          details: 'Integration health check completed'
        }
      } catch (error) {
        results.results.health = {
          success: false,
          checks: healthChecks,
          overallStatus: 'ERROR',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }
    
    // Overall Summary
    const allTests = Object.values(results.results)
    const successCount = allTests.filter((test: any) => test.success).length
    const totalTests = allTests.length
    
    results.summary = {
      totalTests,
      passed: successCount,
      failed: totalTests - successCount,
      overallSuccess: successCount === totalTests,
      healthStatus: successCount === totalTests ? 'ALL_SYSTEMS_GO' : 'ISSUES_DETECTED'
    }
    
    return NextResponse.json(results, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    })
    
  } catch (error) {
    console.error('Integration test API error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body
    
    switch (action) {
      case 'test_branding_update':
        const { error: brandingError } = await supabase
          .from('businesses')
          .update({ branding: data.branding })
          .eq('id', DEMO_BUSINESS_ID)
        
        return NextResponse.json({
          success: !brandingError,
          message: brandingError ? brandingError.message : 'Branding updated successfully',
          data: data.branding
        })
      
      case 'test_location_create':
        const { data: location, error: locationError } = await supabase
          .from('locations')
          .insert({
            business_id: DEMO_BUSINESS_ID,
            name: data.name || 'Test Location',
            address: data.address || '123 Test Street',
            phone: data.phone || '+15551234567',
            is_active: true
          })
          .select()
          .single()
        
        return NextResponse.json({
          success: !locationError,
          message: locationError ? locationError.message : 'Location created successfully',
          data: location
        })
      
      case 'cleanup_test_data':
        // Clean up any test data created during testing
        const cleanupResults = []
        
        try {
          // Remove test locations
          const { error: locCleanupError } = await supabase
            .from('locations')
            .delete()
            .eq('business_id', DEMO_BUSINESS_ID)
            .ilike('name', '%test%')
          
          cleanupResults.push({
            table: 'locations',
            success: !locCleanupError,
            error: locCleanupError?.message
          })
          
          // Remove test white-label domains
          const { error: domainCleanupError } = await supabase
            .from('white_label_domains')
            .delete()
            .eq('business_id', DEMO_BUSINESS_ID)
            .ilike('domain', '%test%')
          
          cleanupResults.push({
            table: 'white_label_domains',
            success: !domainCleanupError,
            error: domainCleanupError?.message
          })
          
        } catch (error) {
          cleanupResults.push({
            table: 'cleanup',
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
        
        return NextResponse.json({
          success: cleanupResults.every(r => r.success),
          message: 'Test data cleanup completed',
          results: cleanupResults
        })
      
      default:
        return NextResponse.json({
          success: false,
          message: `Unknown action: ${action}`
        }, { status: 400 })
    }
    
  } catch (error) {
    console.error('Integration test POST error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}