#!/usr/bin/env node

const inquirer = require('inquirer');
const chalk = require('chalk');
const axios = require('axios');
const ora = require('ora');
const crypto = require('crypto');

class BusinessRegistration {
    constructor() {
        this.supabaseUrl = process.env.SUPABASE_URL;
        this.supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        this.vapiApiKey = process.env.VAPI_API_KEY;
    }

    async registerNewBusiness() {
        console.log(chalk.cyan.bold(`
🏢 Business Registration Portal
==============================
Let's get your beauty business set up on our platform!
`));

        try {
            const businessData = await this.collectBusinessInfo();
            const ownerData = await this.collectOwnerInfo();
            
            console.log(chalk.yellow('\\n🚀 Setting up your business...'));
            
            const business = await this.createBusiness(businessData);
            await this.createBusinessOwner(business.id, ownerData);
            await this.setupVapiAssistant(business);
            await this.createDefaultData(business.id);
            
            console.log(chalk.green.bold('\\n🎉 Business registration completed!'));
            this.printWelcomeInfo(business);
            
            return business;
            
        } catch (error) {
            console.error(chalk.red('❌ Registration failed:'), error.message);
            throw error;
        }
    }

    async collectBusinessInfo() {
        console.log(chalk.blue.bold('\\n📋 Business Information'));
        
        return await inquirer.prompt([
            {
                type: 'input',
                name: 'name',
                message: 'Business name:',
                validate: input => input.length > 0 || 'Business name is required'
            },
            {
                type: 'input',
                name: 'slug',
                message: 'URL slug (for your booking link):',
                default: function(answers) {
                    return answers.name.toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-+|-+$/g, '');
                },
                validate: input => {
                    if (!/^[a-z0-9-]+$/.test(input)) {
                        return 'Slug can only contain lowercase letters, numbers, and hyphens';
                    }
                    return true;
                }
            },
            {
                type: 'list',
                name: 'business_type',
                message: 'Business type:',
                choices: [
                    { name: 'Nail Salon', value: 'nail_salon' },
                    { name: 'Beauty Spa', value: 'spa' },
                    { name: 'Beauty Clinic', value: 'beauty_clinic' },
                    { name: 'Barbershop', value: 'barbershop' }
                ]
            },
            {
                type: 'input',
                name: 'phone',
                message: 'Business phone number:',
                validate: input => input.length > 0 || 'Phone number is required'
            },
            {
                type: 'input',
                name: 'email',
                message: 'Business email:',
                validate: input => {
                    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
                    return emailRegex.test(input) || 'Please enter a valid email address';
                }
            },
            {
                type: 'input',
                name: 'website',
                message: 'Website (optional):'
            },
            {
                type: 'input',
                name: 'address_line1',
                message: 'Street address:',
                validate: input => input.length > 0 || 'Address is required'
            },
            {
                type: 'input',
                name: 'address_line2',
                message: 'Address line 2 (optional):'
            },
            {
                type: 'input',
                name: 'city',
                message: 'City:',
                validate: input => input.length > 0 || 'City is required'
            },
            {
                type: 'input',
                name: 'state',
                message: 'State/Province:',
                validate: input => input.length > 0 || 'State is required'
            },
            {
                type: 'input',
                name: 'zip_code',
                message: 'ZIP/Postal code:',
                validate: input => input.length > 0 || 'ZIP code is required'
            },
            {
                type: 'list',
                name: 'timezone',
                message: 'Timezone:',
                choices: [
                    'America/Los_Angeles',
                    'America/Denver',
                    'America/Chicago', 
                    'America/New_York',
                    'America/Phoenix',
                    'America/Anchorage',
                    'Pacific/Honolulu'
                ],
                default: 'America/Los_Angeles'
            },
            {
                type: 'list',
                name: 'subscription_tier',
                message: 'Choose your plan:',
                choices: [
                    { name: 'Starter - $49/month (1 location, basic features)', value: 'starter' },
                    { name: 'Professional - $99/month (advanced features, analytics)', value: 'professional' },
                    { name: 'Enterprise - $199/month (multi-location, white-label)', value: 'enterprise' }
                ],
                default: 'starter'
            }
        ]);
    }

    async collectOwnerInfo() {
        console.log(chalk.blue.bold('\\n👤 Owner Information'));
        
        return await inquirer.prompt([
            {
                type: 'input',
                name: 'first_name',
                message: 'First name:',
                validate: input => input.length > 0 || 'First name is required'
            },
            {
                type: 'input',
                name: 'last_name', 
                message: 'Last name:',
                validate: input => input.length > 0 || 'Last name is required'
            },
            {
                type: 'input',
                name: 'email',
                message: 'Email address:',
                validate: input => {
                    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
                    return emailRegex.test(input) || 'Please enter a valid email address';
                }
            },
            {
                type: 'input',
                name: 'phone',
                message: 'Phone number:',
                validate: input => input.length > 0 || 'Phone number is required'
            }
        ]);
    }

    async createBusiness(businessData) {
        const spinner = ora('Creating business account...').start();
        
        try {
            // Generate webhook token
            const webhookToken = crypto.randomBytes(32).toString('hex');
            
            const businessRecord = {
                ...businessData,
                webhook_token: webhookToken,
                subscription_status: 'trial',
                trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                monthly_price: this.getMonthlyPrice(businessData.subscription_tier),
                created_at: new Date().toISOString()
            };

            const response = await axios.post(
                `${this.supabaseUrl}/rest/v1/businesses`,
                businessRecord,
                {
                    headers: {
                        'apikey': this.supabaseKey,
                        'Authorization': `Bearer ${this.supabaseKey}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    }
                }
            );

            spinner.succeed('Business account created');
            return response.data[0];
            
        } catch (error) {
            spinner.fail('Failed to create business');
            throw new Error(`Database error: ${error.response?.data?.message || error.message}`);
        }
    }

    async createBusinessOwner(businessId, ownerData) {
        const spinner = ora('Setting up owner account...').start();
        
        try {
            const ownerRecord = {
                business_id: businessId,
                ...ownerData,
                role: 'owner',
                is_active: true,
                created_at: new Date().toISOString()
            };

            const response = await axios.post(
                `${this.supabaseUrl}/rest/v1/business_users`,
                ownerRecord,
                {
                    headers: {
                        'apikey': this.supabaseKey,
                        'Authorization': `Bearer ${this.supabaseKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            spinner.succeed('Owner account created');
            return response.data;
            
        } catch (error) {
            spinner.fail('Failed to create owner account');
            throw new Error(`Owner creation error: ${error.response?.data?.message || error.message}`);
        }
    }

    async setupVapiAssistant(business) {
        const spinner = ora('Setting up AI voice assistant...').start();
        
        try {
            const assistantConfig = {
                name: `${business.name} Receptionist`,
                model: {
                    provider: "openai",
                    model: "gpt-4o",
                    messages: [
                        {
                            role: "system",
                            content: `You are the virtual receptionist for ${business.name}, a ${business.business_type.replace('_', ' ')}. You help customers book appointments, check availability, and manage their bookings. Be warm, professional, and knowledgeable about beauty services.`
                        }
                    ]
                },
                voice: {
                    provider: "11labs",
                    voiceId: "sarah"
                },
                firstMessage: `Hi! Welcome to ${business.name}! I'm your virtual receptionist. I'm here to help you book appointments, check availability, or manage your existing bookings. How can I assist you today?`,
                serverUrl: `${process.env.N8N_API_URL.replace('/api/v1', '')}/webhook/${business.slug}`,
                serverUrlSecret: business.webhook_token,
                // ... include the function definitions from the original config
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

            // Update business with assistant ID
            await axios.patch(
                `${this.supabaseUrl}/rest/v1/businesses?id=eq.${business.id}`,
                { vapi_assistant_id: response.data.id },
                {
                    headers: {
                        'apikey': this.supabaseKey,
                        'Authorization': `Bearer ${this.supabaseKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            spinner.succeed('AI assistant configured');
            return response.data;
            
        } catch (error) {
            spinner.warn('AI assistant setup failed - can be configured later');
            console.log(chalk.yellow(`  Error: ${error.message}`));
        }
    }

    async createDefaultData(businessId) {
        const spinner = ora('Setting up default services and staff...').start();
        
        try {
            // Create default service categories
            const categories = [
                { name: 'Manicures', description: 'Professional nail care and polish services', display_order: 1 },
                { name: 'Pedicures', description: 'Foot care and relaxation treatments', display_order: 2 },
                { name: 'Nail Enhancements', description: 'Gel, acrylics, and nail art', display_order: 3 }
            ];

            for (const category of categories) {
                await axios.post(
                    `${this.supabaseUrl}/rest/v1/service_categories`,
                    { business_id: businessId, ...category },
                    {
                        headers: {
                            'apikey': this.supabaseKey,
                            'Authorization': `Bearer ${this.supabaseKey}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
            }

            // Create default business hours
            const businessHours = [];
            for (let day = 0; day <= 6; day++) {
                businessHours.push({
                    business_id: businessId,
                    day_of_week: day,
                    is_open: day !== 0, // Sunday closed
                    open_time: day === 0 ? null : '09:00',
                    close_time: day === 0 ? null : (day === 6 ? '16:00' : '18:00')
                });
            }

            await axios.post(
                `${this.supabaseUrl}/rest/v1/business_hours`,
                businessHours,
                {
                    headers: {
                        'apikey': this.supabaseKey,
                        'Authorization': `Bearer ${this.supabaseKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            spinner.succeed('Default data created');
            
        } catch (error) {
            spinner.warn('Default data setup had issues - can be configured in dashboard');
        }
    }

    getMonthlyPrice(tier) {
        const prices = {
            'starter': 49.00,
            'professional': 99.00,
            'enterprise': 199.00
        };
        return prices[tier] || 49.00;
    }

    printWelcomeInfo(business) {
        console.log(chalk.green(`
🎉 Welcome to the platform, ${business.name}!

📋 Your Account Details:
   • Business ID: ${business.id}
   • Booking URL: https://${business.slug}.dropfly.ai
   • Subscription: ${business.subscription_tier} plan
   • Trial Period: 14 days

🚀 Next Steps:
   1. Access your dashboard: https://admin.dropfly.ai/dashboard
   2. Add your staff and services
   3. Configure your hours and availability
   4. Test your voice AI booking system

📞 Support:
   • Documentation: https://docs.dropfly.ai
   • Email: support@dropfly.ai
   • Phone: (555) 123-4567

Your 14-day free trial starts now. No credit card required!
        `));
    }
}

async function main() {
    const registration = new BusinessRegistration();
    await registration.registerNewBusiness();
}

if (require.main === module) {
    main();
}

module.exports = BusinessRegistration;