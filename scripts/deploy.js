#!/usr/bin/env node

const chalk = require('chalk');
const ora = require('ora');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log(chalk.cyan.bold(`
🚀 Vapi Nail Salon Agent Deployment
===================================
`));

class Deployer {
    constructor() {
        this.config = this.loadConfig();
        this.workflowId = null;
        this.assistantId = null;
    }

    loadConfig() {
        const requiredVars = [
            'VAPI_API_KEY',
            'N8N_API_URL', 
            'N8N_API_KEY',
            'SUPABASE_URL',
            'SUPABASE_SERVICE_ROLE_KEY'
        ];

        const missing = requiredVars.filter(key => !process.env[key]);
        if (missing.length > 0) {
            console.error(chalk.red('❌ Missing required environment variables:'));
            missing.forEach(key => console.error(chalk.red(`   - ${key}`)));
            console.error(chalk.yellow('\\nRun "npm run setup" first to configure your environment.'));
            process.exit(1);
        }

        return {
            vapi: {
                apiKey: process.env.VAPI_API_KEY,
                phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID
            },
            n8n: {
                apiUrl: process.env.N8N_API_URL,
                apiKey: process.env.N8N_API_KEY
            },
            supabase: {
                url: process.env.SUPABASE_URL,
                serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY
            },
            webhook: {
                url: process.env.WEBHOOK_URL,
                token: process.env.WEBHOOK_AUTH_TOKEN
            }
        };
    }

    async deploy() {
        try {
            console.log(chalk.yellow('🔍 Starting deployment process...\\n'));

            await this.testConnections();
            await this.setupDatabase();
            await this.importWorkflow();
            await this.createVapiAssistant();
            await this.finalizeDeployment();

            console.log(chalk.green.bold('\\n🎉 Deployment completed successfully!\\n'));
            this.printSummary();

        } catch (error) {
            console.error(chalk.red('❌ Deployment failed:'), error.message);
            if (error.response?.data) {
                console.error(chalk.red('Details:'), JSON.stringify(error.response.data, null, 2));
            }
            process.exit(1);
        }
    }

    async testConnections() {
        console.log(chalk.blue('🔌 Testing connections...'));

        const tests = [
            { name: 'N8N API', test: () => this.testN8N() },
            { name: 'Vapi API', test: () => this.testVapi() },
            { name: 'Supabase', test: () => this.testSupabase() }
        ];

        for (const { name, test } of tests) {
            const spinner = ora(`Testing ${name}...`).start();
            try {
                await test();
                spinner.succeed(`${name} connection OK`);
            } catch (error) {
                spinner.fail(`${name} connection failed: ${error.message}`);
                throw error;
            }
        }
    }

    async testN8N() {
        const response = await axios.get(`${this.config.n8n.apiUrl}/workflows`, {
            headers: { 'X-N8N-API-KEY': this.config.n8n.apiKey }
        });
        return response.data;
    }

    async testVapi() {
        const response = await axios.get('https://api.vapi.ai/assistant', {
            headers: { 'Authorization': `Bearer ${this.config.vapi.apiKey}` }
        });
        return response.data;
    }

    async testSupabase() {
        const response = await axios.get(`${this.config.supabase.url}/rest/v1/`, {
            headers: {
                'apikey': this.config.supabase.serviceKey,
                'Authorization': `Bearer ${this.config.supabase.serviceKey}`
            }
        });
        return response.data;
    }

    async setupDatabase() {
        console.log(chalk.blue('\\n🗄️ Setting up database...'));
        
        const spinner = ora('Creating database schema...').start();
        
        try {
            const schemaPath = path.join(__dirname, '..', 'config', 'database-schema.sql');
            const schema = fs.readFileSync(schemaPath, 'utf8');
            
            // Execute SQL schema
            const response = await axios.post(
                `${this.config.supabase.url}/rest/v1/rpc/exec_sql`,
                { sql: schema },
                {
                    headers: {
                        'apikey': this.config.supabase.serviceKey,
                        'Authorization': `Bearer ${this.config.supabase.serviceKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            spinner.succeed('Database schema created successfully');
        } catch (error) {
            spinner.fail('Database setup failed');
            // Try alternative method - create tables individually
            await this.createTablesManually();
        }
    }

    async createTablesManually() {
        const spinner = ora('Creating tables manually...').start();
        
        try {
            // Create appointments table via REST API
            await axios.post(
                `${this.config.supabase.url}/rest/v1/rpc/create_appointments_table`,
                {},
                {
                    headers: {
                        'apikey': this.config.supabase.serviceKey,
                        'Authorization': `Bearer ${this.config.supabase.serviceKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            spinner.succeed('Tables created manually');
        } catch (error) {
            spinner.warn('Manual table creation failed - please run SQL schema manually');
        }
    }

    async importWorkflow() {
        console.log(chalk.blue('\\n⚙️ Importing N8N workflow...'));
        
        const spinner = ora('Importing workflow...').start();
        
        try {
            const workflowPath = path.join(__dirname, '..', 'config', 'workflow.json');
            const workflow = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));
            
            // Update webhook URL in workflow
            this.updateWorkflowConfig(workflow);
            
            const response = await axios.post(
                `${this.config.n8n.apiUrl}/workflows`,
                workflow,
                {
                    headers: {
                        'X-N8N-API-KEY': this.config.n8n.apiKey,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            this.workflowId = response.data.id;
            
            // Activate the workflow
            await axios.post(
                `${this.config.n8n.apiUrl}/workflows/${this.workflowId}/activate`,
                {},
                {
                    headers: { 'X-N8N-API-KEY': this.config.n8n.apiKey }
                }
            );
            
            spinner.succeed(`Workflow imported and activated (ID: ${this.workflowId})`);
            
        } catch (error) {
            spinner.fail('Workflow import failed');
            throw error;
        }
    }

    updateWorkflowConfig(workflow) {
        // Update webhook URL and credentials in the workflow
        workflow.nodes.forEach(node => {
            if (node.type === 'n8n-nodes-base.webhook') {
                // Update webhook path and auth
                if (this.config.webhook.url) {
                    const url = new URL(this.config.webhook.url);
                    node.parameters.path = url.pathname.replace('/webhook/', '');
                }
            }
        });
    }

    async createVapiAssistant() {
        console.log(chalk.blue('\\n🤖 Creating Vapi assistant...'));
        
        const spinner = ora('Creating assistant...').start();
        
        try {
            const assistantPath = path.join(__dirname, '..', 'config', 'vapi-assistant.json');
            const assistantConfig = JSON.parse(fs.readFileSync(assistantPath, 'utf8'));
            
            // Replace template variables
            assistantConfig.serverUrl = this.config.webhook.url;
            assistantConfig.serverUrlSecret = this.config.webhook.token;
            
            const response = await axios.post(
                'https://api.vapi.ai/assistant',
                assistantConfig,
                {
                    headers: {
                        'Authorization': `Bearer ${this.config.vapi.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            this.assistantId = response.data.id;
            spinner.succeed(`Vapi assistant created (ID: ${this.assistantId})`);
            
        } catch (error) {
            spinner.fail('Assistant creation failed');
            throw error;
        }
    }

    async finalizeDeployment() {
        console.log(chalk.blue('\\n🔧 Finalizing deployment...'));
        
        const spinner = ora('Updating configuration...').start();
        
        try {
            // Update .env with new IDs
            this.updateEnvFile();
            
            // Test the complete system
            await this.runSystemTest();
            
            spinner.succeed('Deployment finalized');
            
        } catch (error) {
            spinner.fail('Finalization failed');
            throw error;
        }
    }

    updateEnvFile() {
        const envPath = path.join(__dirname, '..', '.env');
        let envContent = fs.readFileSync(envPath, 'utf8');
        
        if (this.workflowId) {
            envContent = envContent.replace(
                /N8N_WORKFLOW_ID=.*/,
                `N8N_WORKFLOW_ID=${this.workflowId}`
            );
        }
        
        if (this.assistantId) {
            envContent += `\\nVAPI_ASSISTANT_ID=${this.assistantId}\\n`;
        }
        
        fs.writeFileSync(envPath, envContent);
    }

    async runSystemTest() {
        // Basic system health check
        const testData = {
            tool: 'check_availability',
            parameters: {
                service_type: 'manicure_signature',
                preferred_date: new Date().toISOString().split('T')[0]
            }
        };

        try {
            const response = await axios.post(
                this.config.webhook.url,
                testData,
                {
                    headers: {
                        'Authorization': `Bearer ${this.config.webhook.token}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000
                }
            );
            
            return response.data;
        } catch (error) {
            console.warn(chalk.yellow('⚠️ System test failed - manual testing required'));
        }
    }

    printSummary() {
        console.log(chalk.green('📋 Deployment Summary:'));
        console.log(chalk.white(`   • N8N Workflow ID: ${this.workflowId || 'Not set'}`));
        console.log(chalk.white(`   • Vapi Assistant ID: ${this.assistantId || 'Not set'}`));
        console.log(chalk.white(`   • Webhook URL: ${this.config.webhook.url}`));
        
        console.log(chalk.cyan('\\n🧪 Testing:'));
        console.log(chalk.white('   • Call your Vapi phone number to test'));
        console.log(chalk.white('   • Try saying: "I want to book a manicure"'));
        console.log(chalk.white('   • Run: npm run test for automated testing'));
        
        console.log(chalk.cyan('\\n📚 Documentation:'));
        console.log(chalk.white('   • Check docs/ folder for guides'));
        console.log(chalk.white('   • Customize services in config/services.json'));
        console.log(chalk.white('   • Update business info in .env file'));
    }
}

async function main() {
    const deployer = new Deployer();
    await deployer.deploy();
}

if (require.main === module) {
    main();
}

module.exports = Deployer;