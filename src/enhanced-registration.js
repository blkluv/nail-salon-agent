#!/usr/bin/env node

const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');
const { AutomatedOnboarding } = require('./automated-onboarding');

/**
 * Enhanced Registration Flow
 * Beautiful interactive experience for new salon signup
 */
class EnhancedRegistration {
    constructor() {
        this.onboarding = new AutomatedOnboarding();
    }

    async startRegistration() {
        console.log(chalk.cyan.bold(`
🌟 Welcome to DropFly AI Salon Platform
======================================
Transform your nail salon with AI-powered booking in under 5 minutes!

✨ What you'll get:
   • AI voice receptionist that never sleeps
   • Automated booking across 6 channels
   • Professional phone number
   • Complete booking dashboard
   • 14-day free trial

Let's get started!
`));

        try {
            const salonInfo = await this.collectSalonInformation();
            const ownerInfo = await this.collectOwnerInformation();
            const planInfo = await this.selectPlan();
            
            const registrationData = {
                ...salonInfo,
                ...ownerInfo,
                ...planInfo
            };

            console.log(chalk.yellow.bold('\n🚀 Creating your salon platform...'));
            console.log(chalk.gray('This will take about 2-3 minutes.\n'));

            const results = await this.onboarding.onboardNewSalon(registrationData);
            
            await this.showSuccessScreen(results);
            await this.offerNextSteps(results);

            return results;

        } catch (error) {
            console.error(chalk.red.bold('\n❌ Registration Failed'));
            console.error(chalk.red(error.message));
            
            const retry = await inquirer.prompt([{
                type: 'confirm',
                name: 'retry',
                message: 'Would you like to try again?',
                default: true
            }]);

            if (retry.retry) {
                return await this.startRegistration();
            }

            throw error;
        }
    }

    async collectSalonInformation() {
        console.log(chalk.blue.bold('\n📍 SALON INFORMATION'));
        
        const questions = [
            {
                type: 'input',
                name: 'name',
                message: 'What is your salon name?',
                validate: (input) => input.length >= 2 || 'Salon name must be at least 2 characters',
                transformer: (input) => chalk.cyan(input)
            },
            {
                type: 'list',
                name: 'businessType',
                message: 'What type of business is this?',
                choices: [
                    { name: '💅 Nail Salon', value: 'nail_salon' },
                    { name: '🧖‍♀️ Beauty Spa', value: 'spa' },
                    { name: '💄 Beauty Clinic', value: 'beauty_clinic' },
                    { name: '✂️ Barbershop', value: 'barbershop' },
                    { name: '🏢 Other Beauty Business', value: 'other' }
                ],
                default: 0
            },
            {
                type: 'input',
                name: 'phone',
                message: 'Current business phone number:',
                validate: (input) => {
                    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
                    return phoneRegex.test(input) || 'Please enter a valid phone number';
                },
                transformer: (input) => chalk.green(input)
            },
            {
                type: 'input',
                name: 'email',
                message: 'Business email address:',
                validate: (input) => {
                    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
                    return emailRegex.test(input) || 'Please enter a valid email';
                },
                transformer: (input) => chalk.green(input)
            },
            {
                type: 'input',
                name: 'address',
                message: 'Street address:',
                validate: (input) => input.length >= 5 || 'Please enter a complete address'
            },
            {
                type: 'input',
                name: 'city',
                message: 'City:',
                validate: (input) => input.length >= 2 || 'Please enter a valid city'
            },
            {
                type: 'list',
                name: 'state',
                message: 'State:',
                choices: [
                    'CA', 'NY', 'TX', 'FL', 'PA', 'IL', 'OH', 'GA', 'NC', 'MI',
                    'NJ', 'VA', 'WA', 'AZ', 'MA', 'TN', 'IN', 'MO', 'MD', 'WI',
                    'CO', 'MN', 'SC', 'AL', 'LA', 'KY', 'OR', 'OK', 'CT', 'UT',
                    'NV', 'AR', 'MS', 'KS', 'NM', 'NE', 'WV', 'ID', 'HI', 'NH',
                    'ME', 'RI', 'MT', 'DE', 'SD', 'ND', 'AK', 'VT', 'WY'
                ],
                pageSize: 15
            },
            {
                type: 'input',
                name: 'zipCode',
                message: 'ZIP code:',
                validate: (input) => /^\\d{5}(-\\d{4})?$/.test(input) || 'Please enter a valid ZIP code'
            },
            {
                type: 'list',
                name: 'timezone',
                message: 'Timezone:',
                choices: [
                    { name: '🌊 Pacific (Los Angeles, Seattle)', value: 'America/Los_Angeles' },
                    { name: '🏔️ Mountain (Denver, Phoenix)', value: 'America/Denver' },
                    { name: '🌾 Central (Chicago, Dallas)', value: 'America/Chicago' },
                    { name: '🗽 Eastern (New York, Miami)', value: 'America/New_York' },
                    { name: '🌺 Hawaii', value: 'Pacific/Honolulu' },
                    { name: '🗻 Alaska', value: 'America/Anchorage' }
                ],
                default: 0
            }
        ];

        return await inquirer.prompt(questions);
    }

    async collectOwnerInformation() {
        console.log(chalk.blue.bold('\n👤 OWNER INFORMATION'));
        
        const questions = [
            {
                type: 'input',
                name: 'ownerFirstName',
                message: 'Your first name:',
                validate: (input) => input.length >= 1 || 'First name is required'
            },
            {
                type: 'input',
                name: 'ownerLastName',
                message: 'Your last name:',
                validate: (input) => input.length >= 1 || 'Last name is required'
            },
            {
                type: 'input',
                name: 'ownerEmail',
                message: 'Your email (for dashboard access):',
                validate: (input) => {
                    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
                    return emailRegex.test(input) || 'Please enter a valid email';
                }
            },
            {
                type: 'input',
                name: 'ownerPhone',
                message: 'Your personal phone:',
                validate: (input) => {
                    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
                    return phoneRegex.test(input) || 'Please enter a valid phone number';
                }
            }
        ];

        return await inquirer.prompt(questions);
    }

    async selectPlan() {
        console.log(chalk.blue.bold('\n💳 CHOOSE YOUR PLAN'));
        
        const planQuestion = {
            type: 'list',
            name: 'plan',
            message: 'Select your subscription plan:',
            choices: [
                {
                    name: chalk.green('🚀 STARTER - $49/month\n     • 1 location\n     • AI voice booking\n     • Basic dashboard\n     • Email support'),
                    value: 'starter',
                    short: 'Starter ($49/month)'
                },
                {
                    name: chalk.blue('⭐ PROFESSIONAL - $99/month\n     • Multi-location\n     • Advanced analytics\n     • Custom branding\n     • Priority support'),
                    value: 'professional', 
                    short: 'Professional ($99/month)'
                },
                {
                    name: chalk.magenta('👑 ENTERPRISE - $199/month\n     • White-label platform\n     • API access\n     • Dedicated support\n     • Custom features'),
                    value: 'enterprise',
                    short: 'Enterprise ($199/month)'
                }
            ]
        };

        const planAnswer = await inquirer.prompt([planQuestion]);

        const confirmQuestion = {
            type: 'confirm',
            name: 'confirm',
            message: `Confirm ${planAnswer.plan} plan? (14-day free trial, cancel anytime)`,
            default: true
        };

        const confirmAnswer = await inquirer.prompt([confirmQuestion]);

        if (!confirmAnswer.confirm) {
            return await this.selectPlan(); // Ask again
        }

        return planAnswer;
    }

    async showSuccessScreen(results) {
        console.clear();
        console.log(chalk.green.bold(`
🎉 CONGRATULATIONS! YOUR SALON IS LIVE!
=====================================
`));

        console.log(chalk.cyan(`
✅ AI Receptionist: ACTIVE
📱 Your Phone Number: ${chalk.bold.white(results.phoneNumber?.number || 'Provisioning...')}
🌐 Booking Website: ${chalk.bold.white(`https://${results.business.slug}.dropfly.ai`)}
📊 Dashboard: ${chalk.bold.white('https://admin.dropfly.ai/dashboard')}
⏰ Free Trial Until: ${chalk.bold.white(new Date(results.business.trial_ends_at).toLocaleDateString())}
`));

        console.log(chalk.yellow.bold('\n📞 TEST IT RIGHT NOW!'));
        console.log(chalk.white(`Call ${results.phoneNumber?.number} and say:`));
        console.log(chalk.gray(`"Hi, I'd like to book a gel manicure for tomorrow at 2 PM"`));
        
        const testPrompt = await inquirer.prompt([{
            type: 'confirm',
            name: 'tested',
            message: 'Have you tested your phone number?',
            default: false
        }]);

        if (!testPrompt.tested) {
            console.log(chalk.yellow('\n💡 Pro Tip: Test your AI receptionist now to make sure everything works perfectly!'));
        }
    }

    async offerNextSteps(results) {
        console.log(chalk.blue.bold('\n🚀 WHAT\'S NEXT?'));
        
        const nextStepChoices = [
            { name: '📊 Open Dashboard (manage staff, services, hours)', value: 'dashboard' },
            { name: '📱 Update Google Business with new phone number', value: 'google' },
            { name: '📧 Send welcome email to your team', value: 'email' },
            { name: '🔗 Get your booking widget code', value: 'widget' },
            { name: '📞 Forward existing number to new AI line', value: 'forward' },
            { name: '✅ I\'m all set for now', value: 'done' }
        ];

        const nextStep = await inquirer.prompt([{
            type: 'list',
            name: 'action',
            message: 'What would you like to do next?',
            choices: nextStepChoices
        }]);

        switch (nextStep.action) {
            case 'dashboard':
                console.log(chalk.green(`\n🔗 Opening dashboard: https://admin.dropfly.ai/dashboard`));
                console.log(chalk.gray('Login with your email: ' + results.business.email));
                break;
                
            case 'google':
                console.log(chalk.green('\n📱 To update Google Business:'));
                console.log(chalk.white('1. Go to business.google.com'));
                console.log(chalk.white(`2. Update phone to: ${results.phoneNumber?.number}`));
                console.log(chalk.white('3. This helps customers find your AI receptionist!'));
                break;
                
            case 'widget':
                console.log(chalk.green('\n🔗 Your booking widget code:'));
                console.log(chalk.gray(`<iframe src="https://${results.business.slug}.dropfly.ai/widget" width="400" height="600"></iframe>`));
                break;
                
            case 'forward':
                console.log(chalk.green('\n📞 To forward calls:'));
                console.log(chalk.white('1. Contact your phone provider'));
                console.log(chalk.white(`2. Forward to: ${results.phoneNumber?.number}`));
                console.log(chalk.white('3. Test to make sure it works!'));
                break;
                
            case 'done':
                console.log(chalk.green('\n🎉 You\'re all set! Welcome to the future of salon booking.'));
                break;
        }

        if (nextStep.action !== 'done') {
            await this.offerNextSteps(results);
        }
    }

    async quickDemo() {
        console.log(chalk.yellow.bold('\n🎮 DEMO MODE\n'));
        
        const demoData = {
            name: 'Sparkle Nails Demo',
            businessType: 'nail_salon',
            phone: '(555) 123-4567',
            email: 'demo@sparklenails.com',
            address: '123 Demo Street',
            city: 'Los Angeles',
            state: 'CA',
            zipCode: '90210',
            timezone: 'America/Los_Angeles',
            ownerFirstName: 'Demo',
            ownerLastName: 'Owner',
            ownerEmail: 'owner@sparklenails.com',
            ownerPhone: '(555) 987-6543',
            plan: 'starter'
        };

        console.log(chalk.cyan('Creating demo salon with sample data...\n'));
        
        const results = await this.onboarding.onboardNewSalon(demoData);
        await this.showSuccessScreen(results);
        
        return results;
    }
}

/**
 * CLI interface
 */
async function main() {
    const args = process.argv.slice(2);
    const registration = new EnhancedRegistration();
    
    try {
        if (args.includes('--demo')) {
            await registration.quickDemo();
        } else if (args.includes('--help')) {
            console.log(chalk.cyan(`
Usage:
  node enhanced-registration.js          Start interactive registration
  node enhanced-registration.js --demo   Quick demo with sample data
  node enhanced-registration.js --help   Show this help
            `));
        } else {
            await registration.startRegistration();
        }
    } catch (error) {
        console.error(chalk.red('\nRegistration failed:'), error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { EnhancedRegistration };