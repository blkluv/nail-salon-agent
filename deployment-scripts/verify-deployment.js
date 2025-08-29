#!/usr/bin/env node

/**
 * Deployment Verification Script
 * Checks all components of the MVP to ensure they're production-ready
 */

const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[36m'
};

const checkmark = colors.green + '✓' + colors.reset;
const crossmark = colors.red + '✗' + colors.reset;
const warning = colors.yellow + '⚠' + colors.reset;

async function verifyDeployment() {
    console.log('\n' + colors.blue + '🔍 MVP DEPLOYMENT VERIFICATION' + colors.reset);
    console.log('================================\n');
    
    let totalChecks = 0;
    let passedChecks = 0;
    let warnings = 0;
    
    // 1. Check Environment Variables
    console.log(colors.blue + '1. ENVIRONMENT VARIABLES' + colors.reset);
    const requiredEnvVars = [
        'SUPABASE_URL',
        'SUPABASE_SERVICE_KEY',
        'VAPI_API_KEY',
        'TWILIO_ACCOUNT_SID',
        'TWILIO_AUTH_TOKEN',
        'TWILIO_PHONE_NUMBER',
        'N8N_WEBHOOK_URL',
        'JWT_SECRET'
    ];
    
    requiredEnvVars.forEach(envVar => {
        totalChecks++;
        if (process.env[envVar]) {
            console.log(`  ${checkmark} ${envVar}: Set`);
            passedChecks++;
        } else {
            console.log(`  ${crossmark} ${envVar}: Missing`);
        }
    });
    
    // 2. Check Webhook Server
    console.log('\n' + colors.blue + '2. WEBHOOK SERVER' + colors.reset);
    totalChecks++;
    try {
        const webhookUrl = 'https://vapi-nail-salon-agent-production.up.railway.app/health';
        const response = await axios.get(webhookUrl, { timeout: 5000 });
        if (response.status === 200) {
            console.log(`  ${checkmark} Railway deployment: Online`);
            console.log(`    └─ Health check: ${JSON.stringify(response.data)}`);
            passedChecks++;
        }
    } catch (error) {
        console.log(`  ${crossmark} Railway deployment: Offline or unreachable`);
        console.log(`    └─ Error: ${error.message}`);
    }
    
    // 3. Check Supabase Connection
    console.log('\n' + colors.blue + '3. DATABASE CONNECTION' + colors.reset);
    totalChecks++;
    try {
        const supabase = createClient(
            process.env.SUPABASE_URL || 'https://irvyhhkoiyzartmmvbxw.supabase.co',
            process.env.SUPABASE_SERVICE_KEY || ''
        );
        
        const { data, error } = await supabase
            .from('businesses')
            .select('id, name, status')
            .limit(1);
        
        if (!error) {
            console.log(`  ${checkmark} Supabase connection: Active`);
            console.log(`    └─ Database accessible`);
            passedChecks++;
            
            // Check for active businesses
            totalChecks++;
            if (data && data.length > 0) {
                console.log(`  ${checkmark} Active business found: ${data[0].name}`);
                passedChecks++;
            } else {
                console.log(`  ${warning} No active businesses configured`);
                warnings++;
            }
        } else {
            console.log(`  ${crossmark} Supabase connection: Failed`);
            console.log(`    └─ Error: ${error.message}`);
        }
    } catch (error) {
        console.log(`  ${crossmark} Database check failed: ${error.message}`);
    }
    
    // 4. Check N8N Webhook
    console.log('\n' + colors.blue + '4. N8N AUTOMATION' + colors.reset);
    totalChecks++;
    const n8nUrl = process.env.N8N_WEBHOOK_URL;
    if (n8nUrl && !n8nUrl.includes('your-n8n-instance')) {
        console.log(`  ${checkmark} N8N webhook URL: Configured`);
        console.log(`    └─ ${n8nUrl}`);
        passedChecks++;
        
        // Test N8N webhook
        totalChecks++;
        try {
            const testData = {
                event: 'test',
                timestamp: new Date().toISOString()
            };
            const response = await axios.post(n8nUrl, testData, { 
                timeout: 5000,
                validateStatus: () => true 
            });
            
            if (response.status === 404 && response.data?.hint?.includes('workflow must be active')) {
                console.log(`  ${warning} N8N workflow: Created but not activated`);
                console.log(`    └─ Action required: Activate workflow in N8N`);
                warnings++;
            } else if (response.status === 200) {
                console.log(`  ${checkmark} N8N workflow: Active and responding`);
                passedChecks++;
            } else {
                console.log(`  ${crossmark} N8N workflow: Unknown status (${response.status})`);
            }
        } catch (error) {
            console.log(`  ${warning} N8N webhook: Unable to test`);
            console.log(`    └─ ${error.message}`);
            warnings++;
        }
    } else {
        console.log(`  ${crossmark} N8N webhook URL: Not configured`);
    }
    
    // 5. Check Twilio Configuration
    console.log('\n' + colors.blue + '5. TWILIO SMS' + colors.reset);
    totalChecks++;
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        console.log(`  ${checkmark} Twilio credentials: Configured`);
        passedChecks++;
        
        // Could add actual Twilio API test here
        console.log(`    └─ Phone: ${process.env.TWILIO_PHONE_NUMBER}`);
    } else {
        console.log(`  ${crossmark} Twilio credentials: Missing`);
    }
    
    // 6. Check VAPI Configuration
    console.log('\n' + colors.blue + '6. VAPI VOICE AI' + colors.reset);
    totalChecks++;
    if (process.env.VAPI_API_KEY) {
        console.log(`  ${checkmark} VAPI API key: Configured`);
        console.log(`    └─ Phone: (424) 351-9304`);
        passedChecks++;
    } else {
        console.log(`  ${crossmark} VAPI API key: Missing`);
    }
    
    // 7. Check Critical Endpoints
    console.log('\n' + colors.blue + '7. API ENDPOINTS' + colors.reset);
    const endpoints = [
        '/api/customer/auth/send-verification',
        '/api/customer/portal/appointments',
        '/api/analytics/metrics',
        '/webhook/vapi'
    ];
    
    for (const endpoint of endpoints) {
        totalChecks++;
        // Note: These would need actual testing in production
        console.log(`  ${warning} ${endpoint}: Needs manual testing`);
        warnings++;
    }
    
    // Summary
    console.log('\n' + colors.blue + '📊 DEPLOYMENT STATUS SUMMARY' + colors.reset);
    console.log('================================');
    const percentage = Math.round((passedChecks / totalChecks) * 100);
    const status = percentage >= 80 ? colors.green : percentage >= 60 ? colors.yellow : colors.red;
    
    console.log(`Total Checks: ${totalChecks}`);
    console.log(`Passed: ${colors.green}${passedChecks}${colors.reset}`);
    console.log(`Failed: ${colors.red}${totalChecks - passedChecks - warnings}${colors.reset}`);
    console.log(`Warnings: ${colors.yellow}${warnings}${colors.reset}`);
    console.log(`\nReadiness: ${status}${percentage}%${colors.reset}`);
    
    if (percentage >= 80) {
        console.log('\n' + colors.green + '✅ MVP is nearly production-ready!' + colors.reset);
        console.log('Address any warnings and failed checks before launch.');
    } else if (percentage >= 60) {
        console.log('\n' + colors.yellow + '⚠️  MVP needs some configuration' + colors.reset);
        console.log('Complete the failed checks to reach production readiness.');
    } else {
        console.log('\n' + colors.red + '❌ MVP requires significant setup' + colors.reset);
        console.log('Follow the deployment checklist to complete configuration.');
    }
    
    // Action items
    console.log('\n' + colors.blue + '📝 NEXT ACTIONS' + colors.reset);
    console.log('================================');
    if (!process.env.N8N_WEBHOOK_URL || process.env.N8N_WEBHOOK_URL.includes('your-n8n-instance')) {
        console.log('1. Update N8N_WEBHOOK_URL in .env file');
    }
    if (warnings > 0) {
        console.log('2. Activate N8N workflow at https://botthentic.com');
        console.log('3. Configure Twilio credentials in N8N');
        console.log('4. Test API endpoints manually');
    }
    console.log('\nRun this script again after making changes to verify progress.');
}

// Run verification
verifyDeployment().catch(console.error);