#!/usr/bin/env node

const inquirer = require('inquirer');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const ora = require('ora');

console.log(chalk.cyan.bold(`
🎯 Vapi Nail Salon Agent Setup
==============================
`));

const CONFIG_DIR = path.join(__dirname, '..', 'config');
const ENV_FILE = path.join(__dirname, '..', '.env');

async function main() {
    try {
        console.log(chalk.yellow('📋 This setup will help you configure your nail salon voice AI system.\n'));
        
        // Check if .env already exists
        if (fs.existsSync(ENV_FILE)) {
            const { overwrite } = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'overwrite',
                    message: 'Configuration file already exists. Overwrite?',
                    default: false
                }
            ]);
            
            if (!overwrite) {
                console.log(chalk.yellow('Setup cancelled. Use existing configuration.'));
                return;
            }
        }

        const config = await collectConfiguration();
        await writeEnvironmentFile(config);
        
        console.log(chalk.green.bold('\n✅ Setup completed successfully!\n'));
        console.log(chalk.cyan('Next steps:'));
        console.log(chalk.white('1. Review your .env file'));
        console.log(chalk.white('2. Run: npm run deploy'));
        console.log(chalk.white('3. Test your voice agent'));
        
    } catch (error) {
        console.error(chalk.red('❌ Setup failed:'), error.message);
        process.exit(1);
    }
}

async function collectConfiguration() {
    console.log(chalk.blue.bold('\n🏢 Business Information'));
    const business = await inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'Business name:',
            default: 'DropFly Beauty Studio'
        },
        {
            type: 'input',
            name: 'phone',
            message: 'Business phone:',
            default: '(555) 123-4567'
        },
        {
            type: 'input',
            name: 'address',
            message: 'Business address:',
            default: '123 Beauty Lane, Inglewood, CA 90301'
        },
        {
            type: 'input',
            name: 'website',
            message: 'Business website:',
            default: 'www.dropflybeauty.com'
        },
        {
            type: 'list',
            name: 'timezone',
            message: 'Business timezone:',
            choices: [
                'America/Los_Angeles',
                'America/Denver', 
                'America/Chicago',
                'America/New_York',
                'America/Phoenix'
            ],
            default: 'America/Los_Angeles'
        }
    ]);

    console.log(chalk.blue.bold('\n📞 Vapi Configuration'));
    const vapi = await inquirer.prompt([
        {
            type: 'input',
            name: 'apiKey',
            message: 'Vapi API key:',
            validate: input => input.length > 0 || 'API key is required'
        },
        {
            type: 'input',
            name: 'phoneNumberId',
            message: 'Vapi phone number ID:'
        }
    ]);

    console.log(chalk.blue.bold('\n⚙️ N8N Configuration'));
    const n8n = await inquirer.prompt([
        {
            type: 'input',
            name: 'apiUrl',
            message: 'N8N API URL:',
            default: 'https://your-n8n-instance.com/api/v1',
            validate: input => input.startsWith('http') || 'Must be a valid URL'
        },
        {
            type: 'input',
            name: 'apiKey',
            message: 'N8N API key:',
            validate: input => input.length > 0 || 'API key is required'
        }
    ]);

    console.log(chalk.blue.bold('\n🗄️ Supabase Configuration'));
    const supabase = await inquirer.prompt([
        {
            type: 'input',
            name: 'url',
            message: 'Supabase project URL:',
            validate: input => input.includes('supabase.co') || 'Must be a valid Supabase URL'
        },
        {
            type: 'input',
            name: 'anonKey',
            message: 'Supabase anon key:',
            validate: input => input.length > 0 || 'Anon key is required'
        },
        {
            type: 'input',
            name: 'serviceKey',
            message: 'Supabase service role key:',
            validate: input => input.length > 0 || 'Service role key is required'
        }
    ]);

    console.log(chalk.blue.bold('\n📧 Google Configuration'));
    const google = await inquirer.prompt([
        {
            type: 'input',
            name: 'calendarEmail',
            message: 'Google Calendar email:',
            validate: input => input.includes('@') || 'Must be a valid email'
        },
        {
            type: 'input',
            name: 'clientId',
            message: 'Google Client ID:'
        },
        {
            type: 'input',
            name: 'clientSecret',
            message: 'Google Client Secret:'
        },
        {
            type: 'input',
            name: 'refreshToken',
            message: 'Google Refresh Token:'
        },
        {
            type: 'input',
            name: 'gmailEmail',
            message: 'Gmail sending email:',
            default: function(answers) { return google.calendarEmail; }
        }
    ]);

    console.log(chalk.blue.bold('\n🔐 Security Configuration'));
    const security = await inquirer.prompt([
        {
            type: 'input',
            name: 'webhookToken',
            message: 'Webhook auth token (leave empty to generate):',
            default: generateSecureToken()
        }
    ]);

    return {
        business,
        vapi,
        n8n,
        supabase,
        google,
        security
    };
}

function generateSecureToken() {
    return require('crypto').randomBytes(32).toString('hex');
}

async function writeEnvironmentFile(config) {
    const spinner = ora('Writing configuration file...').start();
    
    const envContent = `# Vapi Configuration
VAPI_API_KEY=${config.vapi.apiKey}
VAPI_PHONE_NUMBER_ID=${config.vapi.phoneNumberId}

# N8N Configuration
N8N_API_URL=${config.n8n.apiUrl}
N8N_API_KEY=${config.n8n.apiKey}
N8N_WORKFLOW_ID=

# Supabase Configuration
SUPABASE_URL=${config.supabase.url}
SUPABASE_ANON_KEY=${config.supabase.anonKey}
SUPABASE_SERVICE_ROLE_KEY=${config.supabase.serviceKey}

# Google Calendar Configuration
GOOGLE_CALENDAR_EMAIL=${config.google.calendarEmail}
GOOGLE_CLIENT_ID=${config.google.clientId}
GOOGLE_CLIENT_SECRET=${config.google.clientSecret}
GOOGLE_REFRESH_TOKEN=${config.google.refreshToken}

# Gmail Configuration
GMAIL_EMAIL=${config.google.gmailEmail}
GMAIL_CLIENT_ID=${config.google.clientId}
GMAIL_CLIENT_SECRET=${config.google.clientSecret}
GMAIL_REFRESH_TOKEN=${config.google.refreshToken}

# Business Configuration
BUSINESS_NAME=${config.business.name}
BUSINESS_PHONE=${config.business.phone}
BUSINESS_ADDRESS=${config.business.address}
BUSINESS_WEBSITE=${config.business.website}
BUSINESS_TIMEZONE=${config.business.timezone}

# Webhook Configuration
WEBHOOK_AUTH_TOKEN=${config.security.webhookToken}
WEBHOOK_URL=${config.n8n.apiUrl.replace('/api/v1', '/webhook/maya')}

# Generated on ${new Date().toISOString()}
`;

    fs.writeFileSync(ENV_FILE, envContent);
    spinner.succeed('Configuration file created');
}

if (require.main === module) {
    main();
}

module.exports = { main, collectConfiguration };