#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
require('dotenv').config();

// Import the Vapi assistant configuration
const vapiConfig = require('../config/vapi-assistant.json');

console.log(chalk.cyan.bold(`
🎯 Vapi Assistant Setup & Configuration
========================================
`));

/**
 * Creates or updates a Vapi assistant for the nail salon
 */
async function setupVapiAssistant() {
    const spinner = ora('Setting up Vapi assistant...').start();
    
    try {
        // Check for required environment variables
        const requiredVars = ['VAPI_API_KEY', 'N8N_WEBHOOK_URL', 'WEBHOOK_AUTH_TOKEN'];
        const missing = requiredVars.filter(v => !process.env[v]);
        
        if (missing.length > 0) {
            spinner.fail(`Missing required environment variables: ${missing.join(', ')}`);
            console.log(chalk.yellow('\nPlease run "npm run setup" first to configure your environment.'));
            process.exit(1);
        }

        // Update the assistant configuration with environment variables
        const assistantConfig = {
            ...vapiConfig,
            serverUrl: process.env.N8N_WEBHOOK_URL || process.env.WEBHOOK_URL,
            serverUrlSecret: process.env.WEBHOOK_AUTH_TOKEN,
            name: process.env.BUSINESS_NAME ? `${process.env.BUSINESS_NAME} Receptionist` : vapiConfig.name
        };

        // Update the system prompt with business information
        if (process.env.BUSINESS_NAME) {
            assistantConfig.model.messages[0].content = assistantConfig.model.messages[0].content
                .replace('DropFly Beauty Studio', process.env.BUSINESS_NAME)
                .replace('(555) 123-4567', process.env.BUSINESS_PHONE || '(555) 123-4567')
                .replace('123 Beauty Lane, Inglewood, CA 90301', process.env.BUSINESS_ADDRESS || '123 Beauty Lane, Inglewood, CA 90301');
        }

        // Save the updated configuration
        const configPath = path.join(__dirname, '..', 'config', 'vapi-assistant-configured.json');
        fs.writeFileSync(configPath, JSON.stringify(assistantConfig, null, 2));
        
        spinner.succeed('Vapi assistant configuration prepared');
        
        // Display next steps
        console.log(chalk.green.bold('\n✅ Assistant configuration ready!\n'));
        console.log(chalk.cyan('Configuration saved to: config/vapi-assistant-configured.json\n'));
        
        console.log(chalk.yellow('Next steps to complete setup:\n'));
        console.log(chalk.white('1. Go to https://dashboard.vapi.ai'));
        console.log(chalk.white('2. Create a new assistant using the configuration in config/vapi-assistant-configured.json'));
        console.log(chalk.white('3. Copy the Assistant ID and update your .env file:'));
        console.log(chalk.gray('   VAPI_ASSISTANT_ID=your-assistant-id\n'));
        
        console.log(chalk.cyan('OR use the Vapi API to create the assistant programmatically:'));
        console.log(chalk.gray('   npm run vapi:create-assistant\n'));
        
        // If we have the API key, offer to create the assistant via API
        if (process.env.VAPI_API_KEY) {
            console.log(chalk.blue('📡 Attempting to create assistant via API...'));
            await createAssistantViaAPI(assistantConfig);
        }
        
    } catch (error) {
        spinner.fail('Setup failed');
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
    }
}

/**
 * Creates the assistant using the Vapi API
 */
async function createAssistantViaAPI(config) {
    const spinner = ora('Creating assistant via Vapi API...').start();
    
    try {
        // Import axios dynamically to avoid dependency issues
        const axios = require('axios');
        
        const response = await axios.post(
            'https://api.vapi.ai/assistant',
            config,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        spinner.succeed('Assistant created successfully!');
        console.log(chalk.green(`\n✅ Assistant ID: ${response.data.id}\n`));
        
        // Update the .env file with the assistant ID
        updateEnvFile('VAPI_ASSISTANT_ID', response.data.id);
        
        console.log(chalk.cyan('Your assistant has been created and configured!'));
        console.log(chalk.white('You can now test it by calling your Vapi phone number.\n'));
        
        return response.data;
        
    } catch (error) {
        spinner.fail('Could not create assistant via API');
        
        if (error.response) {
            console.error(chalk.red('API Error:'), error.response.data);
            
            if (error.response.status === 401) {
                console.log(chalk.yellow('\n⚠️  Invalid API key. Please check your VAPI_API_KEY in .env'));
            } else if (error.response.status === 400) {
                console.log(chalk.yellow('\n⚠️  Invalid configuration. Please review the assistant settings.'));
            }
        } else {
            console.error(chalk.red('Network Error:'), error.message);
        }
        
        console.log(chalk.yellow('\nPlease create the assistant manually in the Vapi dashboard.'));
    }
}

/**
 * Updates a value in the .env file
 */
function updateEnvFile(key, value) {
    const envPath = path.join(__dirname, '..', '.env');
    
    try {
        let envContent = fs.readFileSync(envPath, 'utf8');
        
        // Check if the key already exists
        const regex = new RegExp(`^${key}=.*$`, 'm');
        if (regex.test(envContent)) {
            // Update existing value
            envContent = envContent.replace(regex, `${key}=${value}`);
        } else {
            // Add new value
            envContent += `\n${key}=${value}`;
        }
        
        fs.writeFileSync(envPath, envContent);
        console.log(chalk.green(`✅ Updated .env file: ${key}=${value}`));
        
    } catch (error) {
        console.error(chalk.yellow(`⚠️  Could not update .env file. Please add manually: ${key}=${value}`));
    }
}

/**
 * Lists existing Vapi assistants
 */
async function listAssistants() {
    const spinner = ora('Fetching existing assistants...').start();
    
    try {
        const axios = require('axios');
        
        const response = await axios.get(
            'https://api.vapi.ai/assistant',
            {
                headers: {
                    'Authorization': `Bearer ${process.env.VAPI_API_KEY}`
                }
            }
        );
        
        spinner.succeed('Assistants fetched');
        
        if (response.data.length === 0) {
            console.log(chalk.yellow('\nNo assistants found.'));
        } else {
            console.log(chalk.cyan('\n📋 Existing Assistants:\n'));
            response.data.forEach(assistant => {
                console.log(chalk.white(`• ${assistant.name}`));
                console.log(chalk.gray(`  ID: ${assistant.id}`));
                console.log(chalk.gray(`  Model: ${assistant.model?.provider}/${assistant.model?.model}`));
                console.log(chalk.gray(`  Created: ${new Date(assistant.createdAt).toLocaleDateString()}\n`));
            });
        }
        
    } catch (error) {
        spinner.fail('Could not fetch assistants');
        console.error(chalk.red('Error:'), error.message);
    }
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--list')) {
        await listAssistants();
    } else if (args.includes('--help')) {
        console.log(chalk.cyan('Usage:'));
        console.log(chalk.white('  node vapi-setup.js        # Setup and configure assistant'));
        console.log(chalk.white('  node vapi-setup.js --list # List existing assistants'));
        console.log(chalk.white('  node vapi-setup.js --help # Show this help message'));
    } else {
        await setupVapiAssistant();
    }
}

if (require.main === module) {
    main().catch(error => {
        console.error(chalk.red('Fatal error:'), error);
        process.exit(1);
    });
}

module.exports = { setupVapiAssistant, createAssistantViaAPI };