#!/usr/bin/env node

const chalk = require('chalk');
const inquirer = require('inquirer');

async function runInteractiveDemo() {
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

    // Collect basic info
    const salonInfo = await inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'What is your salon name?',
            default: 'Sparkle Nails Demo',
            validate: input => input.length >= 2 || 'Name must be at least 2 characters'
        },
        {
            type: 'list',
            name: 'type',
            message: 'What type of business?',
            choices: [
                '💅 Nail Salon',
                '🧖‍♀️ Beauty Spa', 
                '💄 Beauty Clinic',
                '✂️ Barbershop'
            ],
            default: 0
        },
        {
            type: 'input',
            name: 'phone',
            message: 'Current business phone:',
            default: '(555) 123-4567'
        },
        {
            type: 'input',
            name: 'email',
            message: 'Business email:',
            default: 'demo@sparklenails.com'
        },
        {
            type: 'input',
            name: 'city',
            message: 'City:',
            default: 'Los Angeles'
        },
        {
            type: 'list',
            name: 'state',
            message: 'State:',
            choices: ['CA', 'NY', 'TX', 'FL', 'IL', 'PA'],
            default: 0
        }
    ]);

    // Owner info
    console.log(chalk.blue.bold('\n👤 OWNER INFORMATION'));
    
    const ownerInfo = await inquirer.prompt([
        {
            type: 'input',
            name: 'firstName',
            message: 'Your first name:',
            default: 'Demo'
        },
        {
            type: 'input',
            name: 'lastName',
            message: 'Your last name:',
            default: 'Owner'
        },
        {
            type: 'input',
            name: 'ownerEmail',
            message: 'Your email (for dashboard):',
            default: 'owner@sparklenails.com'
        }
    ]);

    // Plan selection
    console.log(chalk.blue.bold('\n💳 CHOOSE YOUR PLAN'));
    
    const planInfo = await inquirer.prompt([
        {
            type: 'list',
            name: 'plan',
            message: 'Select your subscription plan:',
            choices: [
                {
                    name: chalk.green('🚀 STARTER - $49/month (1 location, basic features)'),
                    value: 'starter',
                    short: 'Starter'
                },
                {
                    name: chalk.blue('⭐ PROFESSIONAL - $99/month (multi-location, analytics)'),
                    value: 'professional',
                    short: 'Professional'
                },
                {
                    name: chalk.magenta('👑 ENTERPRISE - $199/month (white-label, API access)'),
                    value: 'enterprise',
                    short: 'Enterprise'
                }
            ],
            default: 0
        },
        {
            type: 'confirm',
            name: 'confirm',
            message: 'Ready to proceed with setup? (14-day free trial)',
            default: true
        }
    ]);

    if (!planInfo.confirm) {
        console.log(chalk.yellow('\nSetup cancelled. Run again when ready!'));
        return;
    }

    // Simulate setup process
    console.log(chalk.yellow.bold('\n🚀 Creating your salon platform...'));
    console.log(chalk.gray('This normally takes 2-3 minutes.\n'));

    const setupSteps = [
        '✅ Creating business account...',
        '✅ Provisioning phone number... (310) 555-0001',
        '✅ Creating AI assistant...',
        '✅ Setting up booking tools...',
        '✅ Configuring workflow...',
        '✅ Finalizing setup...'
    ];

    for (const step of setupSteps) {
        console.log(chalk.green(step));
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing
    }

    // Success screen
    console.log(chalk.green.bold(`
🎉 CONGRATULATIONS! YOUR SALON IS LIVE!
=====================================

✅ AI Receptionist: ACTIVE
📱 Your Phone Number: (310) 555-0001
🌐 Booking Website: https://${salonInfo.name.toLowerCase().replace(/\s+/g, '-')}.dropfly.ai
📊 Dashboard: https://admin.dropfly.ai/dashboard
⏰ Free Trial Until: ${new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}

📞 TEST IT RIGHT NOW!
Call (310) 555-0001 and say:
"Hi, I'd like to book a gel manicure for tomorrow at 2 PM"
`));

    // Test prompt
    const testPrompt = await inquirer.prompt([{
        type: 'confirm',
        name: 'tested',
        message: 'Have you tested your phone number?',
        default: false
    }]);

    if (!testPrompt.tested) {
        console.log(chalk.yellow('\n💡 Pro Tip: Test your AI receptionist now to ensure everything works!'));
    }

    // Next steps
    console.log(chalk.blue.bold('\n🚀 WHAT WOULD YOU LIKE TO DO NEXT?'));
    
    const nextStep = await inquirer.prompt([{
        type: 'list',
        name: 'action',
        message: 'Choose an action:',
        choices: [
            '📊 Open Dashboard',
            '📱 Update Google Business',
            '🔗 Get booking widget code',
            '📞 Forward existing number',
            '✅ All done for now'
        ]
    }]);

    // Show action-specific info
    switch(nextStep.action) {
        case '📊 Open Dashboard':
            console.log(chalk.green('\n🔗 Dashboard URL: https://admin.dropfly.ai/dashboard'));
            console.log(chalk.gray(`Login with: ${ownerInfo.ownerEmail}`));
            break;
        case '📱 Update Google Business':
            console.log(chalk.green('\n📱 To update Google Business:'));
            console.log('1. Go to business.google.com');
            console.log('2. Update phone to: (310) 555-0001');
            console.log('3. Save changes');
            break;
        case '🔗 Get booking widget code':
            console.log(chalk.green('\n🔗 Your booking widget code:'));
            console.log(chalk.gray(`<iframe src="https://${salonInfo.name.toLowerCase().replace(/\s+/g, '-')}.dropfly.ai/widget" width="400" height="600"></iframe>`));
            break;
        case '📞 Forward existing number':
            console.log(chalk.green('\n📞 To forward calls:'));
            console.log('1. Contact your phone provider');
            console.log('2. Forward to: (310) 555-0001');
            console.log('3. Test the forwarding');
            break;
        default:
            console.log(chalk.green('\n🎉 You are all set! Welcome to the future of salon booking.'));
    }

    console.log(chalk.cyan.bold('\n✨ Thank you for choosing DropFly AI!\n'));
}

// Run the demo
if (require.main === module) {
    runInteractiveDemo().catch(error => {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
    });
}

module.exports = { runInteractiveDemo };