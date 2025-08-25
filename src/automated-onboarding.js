#!/usr/bin/env node

const axios = require('axios');
const chalk = require('chalk');
const ora = require('ora');
const crypto = require('crypto');
const { DatabaseClient } = require('./database-client');
require('dotenv').config();

/**
 * Complete Automated Onboarding System
 * Creates everything a new salon needs in under 5 minutes
 */
class AutomatedOnboarding {
    constructor() {
        this.vapiApiKey = process.env.VAPI_API_KEY;
        this.n8nApiUrl = process.env.N8N_API_URL;
        this.n8nApiKey = process.env.N8N_API_KEY;
        this.platform_domain = process.env.PLATFORM_DOMAIN || 'dropfly.ai';
        
        // Initialize database client
        this.db = new DatabaseClient();
    }

    /**
     * Complete automated onboarding - the main entry point
     */
    async onboardNewSalon(salonData) {
        console.log(chalk.cyan.bold(`
🚀 Automated Salon Onboarding
============================
Setting up: ${salonData.name}
`));

        const results = {};
        
        try {
            // Step 1: Create database records
            results.business = await this.createBusinessInDatabase(salonData);
            
            // Step 2: Provision Vapi phone number
            results.phoneNumber = await this.provisionVapiPhoneNumber(results.business);
            
            // Step 3: Create Vapi tools for this business
            results.tools = await this.createVapiTools(results.business);
            
            // Step 4: Create Vapi assistant
            results.assistant = await this.createVapiAssistant(results.business, results.tools, results.phoneNumber);
            
            // Step 5: Create n8n workflow
            results.workflow = await this.createN8nWorkflow(results.business);
            
            // Step 6: Update business with all IDs
            await this.finalizeBusinessSetup(results.business.id, results);
            
            // Step 7: Send welcome package
            await this.sendWelcomePackage(results.business, results);
            
            console.log(chalk.green.bold('\n🎉 ONBOARDING COMPLETE!'));
            this.printOnboardingResults(results);
            
            return results;
            
        } catch (error) {
            console.error(chalk.red('❌ Onboarding failed:'), error.message);
            
            // Cleanup partial setup
            await this.cleanupFailedOnboarding(results);
            throw error;
        }
    }

    /**
     * Step 1: Create business in database
     */
    async createBusinessInDatabase(salonData) {
        const spinner = ora('Creating business account...').start();
        
        try {
            const result = await this.db.createBusiness(salonData);
            
            if (!result.success) {
                throw new Error(result.error);
            }

            spinner.succeed('Business account created');
            await this.db.logEvent(result.business.id, 'business_created', {
                name: salonData.name,
                plan: salonData.plan
            });
            
            return result.business;
            
        } catch (error) {
            spinner.fail('Failed to create business account');
            throw new Error(`Database error: ${error.message}`);
        }
    }

    /**
     * Step 2: Provision Vapi phone number automatically
     */
    async provisionVapiPhoneNumber(business) {
        const spinner = ora('Provisioning phone number...').start();
        
        try {
            // Request phone number from Vapi (they handle Twilio integration)
            const phoneRequest = {
                provider: "twilio",
                areaCode: this.getAreaCodeFromState(business.state),
                name: `${business.name} - Main Line`,
                assistantId: null // Will update after assistant creation
            };

            const response = await axios.post(
                'https://api.vapi.ai/phone-number',
                phoneRequest,
                {
                    headers: {
                        'Authorization': `Bearer ${this.vapiApiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            spinner.succeed(`Phone number provisioned: ${response.data.number}`);
            return response.data;
            
        } catch (error) {
            spinner.fail('Failed to provision phone number');
            throw new Error(`Phone provisioning error: ${error.response?.data?.message || error.message}`);
        }
    }

    /**
     * Step 3: Create Vapi function tools for this business
     */
    async createVapiTools(business) {
        const spinner = ora('Creating booking tools...').start();
        
        try {
            const tools = [];
            const baseUrl = `https://${this.platform_domain}/webhook/${business.slug}`;
            
            // Tool definitions for this specific business
            const toolDefinitions = [
                {
                    name: 'check_availability',
                    description: `Check available appointment slots at ${business.name}`,
                    type: 'apiRequest',
                    apiRequest: {
                        url: baseUrl,
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${business.webhook_token}`,
                            'Content-Type': 'application/json'
                        },
                        body: {
                            type: 'object',
                            properties: {
                                tool: { type: 'string', enum: ['check_availability'] },
                                preferred_date: { type: 'string', description: 'Date in YYYY-MM-DD format' },
                                service_type: { 
                                    type: 'string', 
                                    enum: ['manicure_signature', 'manicure_gel', 'pedicure', 'combo', 'enhancement'],
                                    description: 'Type of service requested'
                                },
                                preferred_time: { type: 'string', description: 'Preferred time slot' }
                            },
                            required: ['tool', 'preferred_date', 'service_type']
                        }
                    }
                },
                {
                    name: 'book_appointment',
                    description: `Book a new appointment at ${business.name}`,
                    type: 'apiRequest',
                    apiRequest: {
                        url: baseUrl,
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${business.webhook_token}`,
                            'Content-Type': 'application/json'
                        },
                        body: {
                            type: 'object',
                            properties: {
                                tool: { type: 'string', enum: ['book_appointment'] },
                                customer_name: { type: 'string', description: 'Customer full name' },
                                customer_email: { type: 'string', description: 'Customer email' },
                                customer_phone: { type: 'string', description: 'Customer phone' },
                                service_type: { 
                                    type: 'string',
                                    enum: ['manicure_signature', 'manicure_gel', 'pedicure', 'combo', 'enhancement']
                                },
                                appointment_date: { type: 'string', description: 'Date in YYYY-MM-DD' },
                                start_time: { type: 'string', description: 'Time in HH:MM format' }
                            },
                            required: ['tool', 'customer_name', 'customer_email', 'customer_phone', 'service_type', 'appointment_date', 'start_time']
                        }
                    }
                },
                {
                    name: 'check_appointments',
                    description: `Look up existing appointments at ${business.name}`,
                    type: 'apiRequest',
                    apiRequest: {
                        url: baseUrl,
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${business.webhook_token}`,
                            'Content-Type': 'application/json'
                        },
                        body: {
                            type: 'object',
                            properties: {
                                tool: { type: 'string', enum: ['check_appointments'] },
                                customer_email: { type: 'string', description: 'Customer email' },
                                customer_phone: { type: 'string', description: 'Customer phone' },
                                date_range: { 
                                    type: 'string', 
                                    enum: ['upcoming', 'past', 'today', 'all'],
                                    description: 'Which appointments to show'
                                }
                            },
                            required: ['tool']
                        }
                    }
                },
                {
                    name: 'cancel_appointment',
                    description: `Cancel an appointment at ${business.name}`,
                    type: 'apiRequest',
                    apiRequest: {
                        url: baseUrl,
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${business.webhook_token}`,
                            'Content-Type': 'application/json'
                        },
                        body: {
                            type: 'object',
                            properties: {
                                tool: { type: 'string', enum: ['cancel_appointment'] },
                                customer_email: { type: 'string', description: 'Customer email' },
                                appointment_date: { type: 'string', description: 'Date to cancel' },
                                cancellation_reason: { type: 'string', description: 'Reason for cancellation' }
                            },
                            required: ['tool', 'customer_email']
                        }
                    }
                }
            ];

            // Create each tool via Vapi API
            for (const toolDef of toolDefinitions) {
                const response = await axios.post(
                    'https://api.vapi.ai/tool',
                    toolDef,
                    {
                        headers: {
                            'Authorization': `Bearer ${this.vapiApiKey}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                
                tools.push({
                    name: toolDef.name,
                    id: response.data.id,
                    config: response.data
                });
            }

            spinner.succeed(`Created ${tools.length} booking tools`);
            return tools;
            
        } catch (error) {
            spinner.fail('Failed to create booking tools');
            throw new Error(`Tool creation error: ${error.response?.data?.message || error.message}`);
        }
    }

    /**
     * Step 4: Create Vapi assistant with business-specific configuration
     */
    async createVapiAssistant(business, tools, phoneNumber) {
        const spinner = ora('Creating AI assistant...').start();
        
        try {
            const systemPrompt = `You are the virtual receptionist for ${business.name}, a professional nail salon located in ${business.city}, ${business.state}. 

Your role is to help customers:
- Book nail appointments 
- Check service availability
- Look up existing bookings
- Handle appointment changes and cancellations
- Provide information about services and pricing

SERVICES & PRICING:
- Signature Manicure: 60 min, $45
- Gel Manicure: 75 min, $55  
- Classic Pedicure: 90 min, $65
- Manicure + Pedicure Combo: 150 min, $95
- Nail Enhancement (acrylics/extensions): 120 min, $85

BUSINESS INFO:
- Location: ${business.address_line1}, ${business.city}, ${business.state} ${business.zip_code}
- Phone: ${business.phone}
- Hours: Monday-Saturday 9:00 AM - 6:00 PM, Closed Sundays

CONVERSATION GUIDELINES:
1. Be warm, professional, and use customer's name when provided
2. Gather information naturally through conversation
3. Always check availability before confirming bookings
4. Confirm all details before finalizing appointments
5. For bookings collect: name, email, phone, service, date/time
6. Use functions only when you have all required information

IMPORTANT: Only call functions when you have gathered necessary information. Always confirm booking details before finalizing.`;

            const assistantConfig = {
                name: `${business.name} Receptionist`,
                model: {
                    provider: "openai",
                    model: "gpt-4o",
                    messages: [
                        {
                            role: "system",
                            content: systemPrompt
                        }
                    ]
                },
                voice: {
                    provider: "11labs",
                    voiceId: "sarah"
                },
                transcriber: {
                    provider: "deepgram",
                    model: "nova-3"
                },
                firstMessage: `Hi! Welcome to ${business.name}! I'm your virtual receptionist. I'm here to help you book appointments, check availability, or manage your existing bookings. How can I assist you today?`,
                toolIds: tools.map(tool => tool.id)
            };

            const response = await axios.post(
                'https://api.vapi.ai/assistant',
                assistantConfig,
                {
                    headers: {
                        'Authorization': `Bearer ${this.vapiApiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Update phone number with assistant ID
            if (phoneNumber && phoneNumber.id) {
                await axios.patch(
                    `https://api.vapi.ai/phone-number/${phoneNumber.id}`,
                    { assistantId: response.data.id },
                    {
                        headers: {
                            'Authorization': `Bearer ${this.vapiApiKey}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
            }

            spinner.succeed('AI assistant created and linked to phone number');
            return response.data;
            
        } catch (error) {
            spinner.fail('Failed to create AI assistant');
            throw new Error(`Assistant creation error: ${error.response?.data?.message || error.message}`);
        }
    }

    /**
     * Step 5: Create n8n workflow for this business
     */
    async createN8nWorkflow(business) {
        const spinner = ora('Setting up booking workflow...').start();
        
        try {
            // Load the template workflow
            const templateWorkflow = require('../config/workflow.json');
            
            // Customize workflow for this business
            const customWorkflow = {
                ...templateWorkflow,
                name: `${business.name} - Booking Workflow`,
                active: true,
                // Update webhook path to use business slug
                nodes: templateWorkflow.nodes.map(node => {
                    if (node.type === 'n8n-nodes-base.webhook') {
                        return {
                            ...node,
                            parameters: {
                                ...node.parameters,
                                path: business.slug // webhook will be /webhook/{slug}
                            }
                        };
                    }
                    
                    // Update any business-specific configuration in other nodes
                    if (node.name === 'Business Config') {
                        return {
                            ...node,
                            parameters: {
                                ...node.parameters,
                                functionCode: node.parameters.functionCode
                                    .replace('BUSINESS_ID_PLACEHOLDER', business.id)
                                    .replace('WEBHOOK_TOKEN_PLACEHOLDER', business.webhook_token)
                            }
                        };
                    }
                    
                    return node;
                })
            };

            // Create workflow in n8n
            const response = await axios.post(
                `${this.n8nApiUrl}/workflows`,
                customWorkflow,
                {
                    headers: {
                        'X-N8N-API-KEY': this.n8nApiKey,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Activate the workflow
            await axios.post(
                `${this.n8nApiUrl}/workflows/${response.data.id}/activate`,
                {},
                {
                    headers: {
                        'X-N8N-API-KEY': this.n8nApiKey
                    }
                }
            );

            spinner.succeed('Booking workflow created and activated');
            return response.data;
            
        } catch (error) {
            spinner.fail('Failed to create booking workflow');
            throw new Error(`Workflow creation error: ${error.response?.data?.message || error.message}`);
        }
    }

    /**
     * Step 6: Update business record with all integration IDs
     */
    async finalizeBusinessSetup(businessId, results) {
        const spinner = ora('Finalizing setup...').start();
        
        try {
            const updateData = {
                vapi_assistant_id: results.assistant?.id,
                vapi_phone_number_id: results.phoneNumber?.id,
                n8n_workflow_id: results.workflow?.id,
                onboarding_completed: true,
                updated_at: new Date().toISOString()
            };

            await axios.patch(
                `${this.supabaseUrl}/rest/v1/businesses?id=eq.${businessId}`,
                updateData,
                {
                    headers: {
                        'apikey': this.supabaseKey,
                        'Authorization': `Bearer ${this.supabaseKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            spinner.succeed('Setup finalized');
            
        } catch (error) {
            spinner.warn('Could not finalize setup - manual update may be needed');
        }
    }

    /**
     * Step 7: Send welcome package with all details
     */
    async sendWelcomePackage(business, results) {
        const spinner = ora('Sending welcome package...').start();
        
        try {
            const welcomeData = {
                businessName: business.name,
                phoneNumber: results.phoneNumber?.number,
                assistantId: results.assistant?.id,
                bookingUrl: `https://${business.slug}.${this.platform_domain}`,
                dashboardUrl: `https://admin.${this.platform_domain}/dashboard`,
                trialEndsAt: business.trial_ends_at
            };

            // In production, you'd send this via email service
            // For now, we'll save it to the business record
            await axios.patch(
                `${this.supabaseUrl}/rest/v1/businesses?id=eq.${business.id}`,
                { welcome_package_sent: true },
                {
                    headers: {
                        'apikey': this.supabaseKey,
                        'Authorization': `Bearer ${this.supabaseKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            spinner.succeed('Welcome package prepared');
            
        } catch (error) {
            spinner.warn('Welcome package had issues');
        }
    }

    /**
     * Cleanup if onboarding fails partway through
     */
    async cleanupFailedOnboarding(results) {
        console.log(chalk.yellow('\n🧹 Cleaning up partial setup...'));
        
        // Delete created resources in reverse order
        if (results.workflow?.id) {
            try {
                await axios.delete(`${this.n8nApiUrl}/workflows/${results.workflow.id}`, {
                    headers: { 'X-N8N-API-KEY': this.n8nApiKey }
                });
            } catch {}
        }
        
        if (results.assistant?.id) {
            try {
                await axios.delete(`https://api.vapi.ai/assistant/${results.assistant.id}`, {
                    headers: { 'Authorization': `Bearer ${this.vapiApiKey}` }
                });
            } catch {}
        }
        
        if (results.tools) {
            for (const tool of results.tools) {
                try {
                    await axios.delete(`https://api.vapi.ai/tool/${tool.id}`, {
                        headers: { 'Authorization': `Bearer ${this.vapiApiKey}` }
                    });
                } catch {}
            }
        }
        
        if (results.phoneNumber?.id) {
            try {
                await axios.delete(`https://api.vapi.ai/phone-number/${results.phoneNumber.id}`, {
                    headers: { 'Authorization': `Bearer ${this.vapiApiKey}` }
                });
            } catch {}
        }
        
        if (results.business?.id) {
            try {
                await axios.delete(`${this.supabaseUrl}/rest/v1/businesses?id=eq.${results.business.id}`, {
                    headers: {
                        'apikey': this.supabaseKey,
                        'Authorization': `Bearer ${this.supabaseKey}`
                    }
                });
            } catch {}
        }
    }

    /**
     * Utility functions
     */
    generateSlug(name) {
        return name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .substring(0, 50);
    }

    getPlanPrice(plan) {
        const prices = {
            'starter': 49.00,
            'professional': 99.00,
            'enterprise': 199.00
        };
        return prices[plan] || 49.00;
    }

    getAreaCodeFromState(state) {
        const areaCodes = {
            'CA': '310', 'NY': '212', 'TX': '214', 'FL': '305',
            'IL': '312', 'PA': '215', 'OH': '216', 'GA': '404',
            'NC': '704', 'MI': '313', 'NJ': '201', 'VA': '703'
        };
        return areaCodes[state] || '555'; // Default to 555 if state not mapped
    }

    printOnboardingResults(results) {
        console.log(chalk.green(`
📱 PHONE NUMBER: ${results.phoneNumber?.number || 'Pending'}
🤖 ASSISTANT ID: ${results.assistant?.id || 'Pending'}
🔗 BOOKING URL: https://${results.business.slug}.${this.platform_domain}
📊 DASHBOARD: https://admin.${this.platform_domain}/dashboard
⏰ TRIAL ENDS: ${new Date(results.business.trial_ends_at).toLocaleDateString()}

🎯 WHAT'S NEXT:
1. Test your phone number immediately
2. Add your staff and customize services  
3. Update your Google Business listing with new number
4. Start taking bookings!

💡 PRO TIP: Forward your existing business line to ${results.phoneNumber?.number} 
   so you don't miss any calls during transition.
        `));
    }
}

/**
 * Quick onboarding function for testing
 */
async function quickDemo() {
    const demoSalon = {
        name: "Sparkle Nails Demo",
        phone: "(555) 123-4567",
        email: "demo@sparklenails.com", 
        address: "123 Main St",
        city: "Los Angeles",
        state: "CA",
        zipCode: "90210",
        plan: "starter"
    };
    
    const onboarding = new AutomatedOnboarding();
    return await onboarding.onboardNewSalon(demoSalon);
}

module.exports = { AutomatedOnboarding, quickDemo };

// CLI usage
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.includes('--demo')) {
        quickDemo().catch(console.error);
    } else {
        console.log(chalk.cyan('Usage:'));
        console.log(chalk.white('  node automated-onboarding.js --demo    # Test with demo salon'));
        console.log(chalk.white('  require() and call onboardNewSalon()   # Programmatic usage'));
    }
}