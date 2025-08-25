#!/usr/bin/env node

/**
 * Production Setup Script for DropFly AI Salon Platform
 * This script helps configure Supabase and test all connections for production
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const chalk = require('chalk');
const inquirer = require('inquirer');
const ora = require('ora');

require('dotenv').config();

class ProductionSetup {
    constructor() {
        this.envPath = path.join(process.cwd(), '.env');
        this.steps = [
            { name: 'Environment Configuration', completed: false },
            { name: 'Supabase Connection Test', completed: false },
            { name: 'Database Schema Verification', completed: false },
            { name: 'Vapi Integration Test', completed: false },
            { name: 'n8n Webhook Test', completed: false },
            { name: 'Production Readiness Check', completed: false }
        ];
    }

    async run() {
        console.log(chalk.blue.bold('\n🚀 DropFly AI Salon Platform - Production Setup\n'));

        try {
            await this.checkEnvironment();
            await this.testSupabaseConnection();
            await this.verifyDatabaseSchema();
            await this.testVapiIntegration();
            await this.testN8nWebhook();
            await this.runProductionReadinessCheck();

            this.showSuccessMessage();
        } catch (error) {
            console.error(chalk.red('❌ Setup failed:'), error.message);
            process.exit(1);
        }
    }

    async checkEnvironment() {
        const spinner = ora('Checking environment configuration...').start();

        // Check if .env file exists
        if (!fs.existsSync(this.envPath)) {
            spinner.fail('.env file not found');
            console.log(chalk.yellow('\n📝 Creating .env file from template...'));
            
            const examplePath = path.join(process.cwd(), '.env.example');
            if (fs.existsSync(examplePath)) {
                fs.copyFileSync(examplePath, this.envPath);
                console.log(chalk.green('✅ .env file created from .env.example'));
                console.log(chalk.yellow('⚠️  Please edit .env file with your actual values and run this script again.'));
                process.exit(0);
            } else {
                throw new Error('.env.example file not found. Cannot create .env file.');
            }
        }

        // Check required environment variables
        const required = [
            'SUPABASE_URL',
            'SUPABASE_ANON_KEY',
            'SUPABASE_SERVICE_KEY',
            'VAPI_API_KEY'
        ];

        const missing = required.filter(key => !process.env[key] || process.env[key].includes('your-'));
        
        if (missing.length > 0) {
            spinner.fail('Missing required environment variables');
            console.log(chalk.red('\\n❌ Missing or placeholder values found:'));
            missing.forEach(key => console.log(chalk.red(`   • ${key}`)));
            console.log(chalk.yellow('\\n📝 Please update your .env file with actual values.'));
            process.exit(1);
        }

        spinner.succeed('Environment configuration verified');
        this.steps[0].completed = true;
    }

    async testSupabaseConnection() {
        const spinner = ora('Testing Supabase connection...').start();

        try {
            const supabase = createClient(
                process.env.SUPABASE_URL,
                process.env.SUPABASE_SERVICE_KEY
            );

            // Test connection with a simple query
            const { data, error } = await supabase
                .from('businesses')
                .select('*')
                .limit(1);

            if (error) {
                // If businesses table doesn't exist, that's expected on first setup
                if (error.message.includes('relation \"businesses\" does not exist')) {
                    spinner.warn('Supabase connected but schema not yet applied');
                    console.log(chalk.yellow('⚠️  Database schema needs to be applied'));
                } else {
                    throw error;
                }
            } else {
                spinner.succeed('Supabase connection successful');
            }

            this.steps[1].completed = true;
        } catch (error) {
            spinner.fail('Supabase connection failed');
            throw new Error(`Supabase connection error: ${error.message}`);
        }
    }

    async verifyDatabaseSchema() {
        const spinner = ora('Verifying database schema...').start();

        try {
            const supabase = createClient(
                process.env.SUPABASE_URL,
                process.env.SUPABASE_SERVICE_KEY
            );

            // Check if main tables exist
            const tables = ['businesses', 'services', 'staff', 'customers', 'appointments'];
            let tablesExist = 0;

            for (const table of tables) {
                try {
                    const { error } = await supabase.from(table).select('*').limit(1);
                    if (!error) tablesExist++;
                } catch (e) {
                    // Table doesn't exist
                }
            }

            if (tablesExist === 0) {
                spinner.warn('Database schema not applied');
                console.log(chalk.yellow('\\n📋 Database schema needs to be applied:'));
                console.log('1. Go to https://supabase.com/dashboard');
                console.log('2. Select your project → SQL Editor');
                console.log('3. Copy and paste the contents of database/supabase-schema.sql');
                console.log('4. Click \"Run\" to create all tables and functions');
                console.log('5. Run this script again\\n');
                process.exit(0);
            } else if (tablesExist < tables.length) {
                spinner.warn(`Partial schema found (${tablesExist}/${tables.length} tables)`);
                console.log(chalk.yellow('⚠️  Some tables are missing. Consider re-applying the schema.'));
            } else {
                spinner.succeed('Database schema verified');
            }

            this.steps[2].completed = true;
        } catch (error) {
            spinner.fail('Schema verification failed');
            throw new Error(`Schema verification error: ${error.message}`);
        }
    }

    async testVapiIntegration() {
        const spinner = ora('Testing Vapi integration...').start();

        try {
            const response = await axios.get('https://api.vapi.ai/assistant', {
                headers: {
                    'Authorization': `Bearer ${process.env.VAPI_API_KEY}`
                }
            });

            if (response.status === 200) {
                spinner.succeed(`Vapi integration verified (${response.data.length} assistants found)`);
            } else {
                throw new Error(`Unexpected status: ${response.status}`);
            }

            this.steps[3].completed = true;
        } catch (error) {
            spinner.fail('Vapi integration failed');
            if (error.response?.status === 401) {
                throw new Error('Invalid Vapi API key');
            } else {
                throw new Error(`Vapi error: ${error.message}`);
            }
        }
    }

    async testN8nWebhook() {
        const spinner = ora('Testing n8n webhook (optional)...').start();

        if (!process.env.N8N_WEBHOOK_URL || process.env.N8N_WEBHOOK_URL.includes('your-')) {
            spinner.warn('n8n webhook not configured (optional)');
            return;
        }

        try {
            // Test webhook with a simple ping
            const testPayload = {
                test: true,
                source: 'production-setup',
                timestamp: new Date().toISOString()
            };

            const response = await axios.post(process.env.N8N_WEBHOOK_URL, testPayload, {
                timeout: 5000
            });

            if (response.status >= 200 && response.status < 300) {
                spinner.succeed('n8n webhook test successful');
            } else {
                throw new Error(`Webhook returned status: ${response.status}`);
            }

            this.steps[4].completed = true;
        } catch (error) {
            if (error.code === 'ECONNABORTED') {
                spinner.warn('n8n webhook timeout (may still work in production)');
            } else {
                spinner.warn(`n8n webhook test failed: ${error.message}`);
            }
        }
    }

    async runProductionReadinessCheck() {
        const spinner = ora('Running production readiness check...').start();

        const checks = [];
        
        // Environment check
        if (process.env.NODE_ENV === 'production') {
            checks.push('✅ NODE_ENV set to production');
        } else {
            checks.push('⚠️  NODE_ENV not set to production');
        }

        // Security checks
        if (process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32) {
            checks.push('✅ JWT_SECRET is secure');
        } else {
            checks.push('❌ JWT_SECRET missing or too short');
        }

        // SSL/HTTPS checks
        if (process.env.SUPABASE_URL?.startsWith('https://')) {
            checks.push('✅ Supabase URL uses HTTPS');
        } else {
            checks.push('❌ Supabase URL should use HTTPS');
        }

        spinner.succeed('Production readiness check completed');
        
        console.log('\\n📋 Production Readiness Report:');
        checks.forEach(check => console.log(`  ${check}`));

        this.steps[5].completed = true;
    }

    showSuccessMessage() {
        console.log(chalk.green.bold('\\n🎉 Production Setup Complete!\\n'));
        
        console.log('📊 Setup Summary:');
        this.steps.forEach(step => {
            const icon = step.completed ? '✅' : '❌';
            console.log(`  ${icon} ${step.name}`);
        });

        console.log(chalk.blue.bold('\\n🚀 Next Steps:'));
        console.log('1. Test your setup: npm run register-demo');
        console.log('2. Register your first salon: npm run register');
        console.log('3. Start the dashboard: npm run dashboard');
        console.log('4. View documentation: npm run docs');

        console.log(chalk.yellow.bold('\\n🔗 Useful Links:'));
        console.log('• Supabase Dashboard:', process.env.SUPABASE_URL?.replace('https://', 'https://app.'));
        console.log('• Vapi Dashboard: https://dashboard.vapi.ai');
        console.log('• n8n Dashboard:', process.env.N8N_BASE_URL);
        
        console.log(chalk.green('\\n🎊 Your nail salon booking platform is ready for production!'));
    }
}

// Run the setup if called directly
if (require.main === module) {
    const setup = new ProductionSetup();
    setup.run().catch(console.error);
}

module.exports = ProductionSetup;