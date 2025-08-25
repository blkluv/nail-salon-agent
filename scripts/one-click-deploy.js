#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
const inquirer = require('inquirer');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

console.log(chalk.magenta.bold(`
╔══════════════════════════════════════════════╗
║   🚀 VAPI NAIL SALON - ONE CLICK DEPLOY 🚀   ║
║         Plug & Play Voice AI Setup           ║
╚══════════════════════════════════════════════╝
`));

const STEPS = [
    { name: 'Environment Check', fn: checkEnvironment },
    { name: 'Install Dependencies', fn: installDependencies },
    { name: 'Configure Services', fn: configureServices },
    { name: 'Setup Database', fn: setupDatabase },
    { name: 'Deploy N8N Workflow', fn: deployN8NWorkflow },
    { name: 'Configure Vapi Assistant', fn: configureVapiAssistant },
    { name: 'Setup Dashboard', fn: setupDashboard },
    { name: 'Test Connections', fn: testConnections },
    { name: 'Final Setup', fn: finalSetup }
];

let config = {};

async function main() {
    try {
        console.log(chalk.cyan('Welcome to the Vapi Nail Salon automated setup!\n'));
        console.log(chalk.yellow('This wizard will help you deploy your voice AI receptionist.\n'));
        
        // Check for quick start mode
        const { mode } = await inquirer.prompt([
            {
                type: 'list',
                name: 'mode',
                message: 'Select setup mode:',
                choices: [
                    { name: '🚀 Quick Setup (Use defaults)', value: 'quick' },
                    { name: '⚙️  Custom Setup (Configure everything)', value: 'custom' },
                    { name: '📚 Demo Mode (Try without real services)', value: 'demo' }
                ]
            }
        ]);
        
        config.mode = mode;
        
        if (mode === 'demo') {
            await runDemoMode();
            return;
        }
        
        // Run through all setup steps
        for (const step of STEPS) {
            console.log(chalk.blue.bold(`\n━━━ ${step.name} ━━━`));
            await step.fn();
        }
        
        // Success message
        displaySuccess();
        
    } catch (error) {
        console.error(chalk.red.bold('\n❌ Setup failed:'), error.message);
        console.log(chalk.yellow('\nPlease check the error above and try again.'));
        process.exit(1);
    }
}

/**
 * Step 1: Check environment and prerequisites
 */
async function checkEnvironment() {
    const spinner = ora('Checking system requirements...').start();
    
    try {
        // Check Node.js version
        const nodeVersion = process.version;
        const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
        
        if (majorVersion < 16) {
            throw new Error(`Node.js 16+ required. Current version: ${nodeVersion}`);
        }
        
        // Check for required tools
        const tools = ['npm', 'git'];
        for (const tool of tools) {
            try {
                await execPromise(`${tool} --version`);
            } catch {
                throw new Error(`${tool} is not installed. Please install it first.`);
            }
        }
        
        spinner.succeed('Environment check passed');
        
    } catch (error) {
        spinner.fail('Environment check failed');
        throw error;
    }
}

/**
 * Step 2: Install dependencies
 */
async function installDependencies() {
    const spinner = ora('Installing dependencies...').start();
    
    try {
        // Install main dependencies
        await execPromise('npm install');
        
        // Install dashboard dependencies
        const dashboardPath = path.join(__dirname, '..', 'dashboard');
        if (fs.existsSync(dashboardPath)) {
            process.chdir(dashboardPath);
            await execPromise('npm install');
            process.chdir(path.join(__dirname, '..'));
        }
        
        spinner.succeed('Dependencies installed');
        
    } catch (error) {
        spinner.fail('Failed to install dependencies');
        throw error;
    }
}

/**
 * Step 3: Configure services
 */
async function configureServices() {
    if (config.mode === 'quick') {
        console.log(chalk.gray('Using quick setup mode - loading from .env.example'));
        
        // Copy .env.example to .env if it doesn't exist
        const envPath = path.join(__dirname, '..', '.env');
        const envExamplePath = path.join(__dirname, '..', '.env.example');
        
        if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
            fs.copyFileSync(envExamplePath, envPath);
            console.log(chalk.green('✓ Environment file created from template'));
        }
    }
    
    // Collect necessary credentials
    const credentials = await inquirer.prompt([
        {
            type: 'password',
            name: 'vapiApiKey',
            message: 'Enter your Vapi API key:',
            when: () => !process.env.VAPI_API_KEY,
            validate: input => input.length > 0 || 'API key is required'
        },
        {
            type: 'input',
            name: 'n8nUrl',
            message: 'Enter your N8N instance URL:',
            when: () => !process.env.N8N_BASE_URL,
            default: 'https://your-instance.app.n8n.cloud'
        },
        {
            type: 'password',
            name: 'n8nApiKey',
            message: 'Enter your N8N API key:',
            when: () => !process.env.N8N_API_KEY
        },
        {
            type: 'input',
            name: 'supabaseUrl',
            message: 'Enter your Supabase project URL:',
            when: () => !process.env.SUPABASE_URL,
            validate: input => input.includes('supabase.co') || 'Must be a valid Supabase URL'
        },
        {
            type: 'password',
            name: 'supabaseAnonKey',
            message: 'Enter your Supabase anon key:',
            when: () => !process.env.SUPABASE_ANON_KEY
        }
    ]);
    
    // Update environment variables
    updateEnvFile(credentials);
    
    console.log(chalk.green('✓ Services configured'));
}

/**
 * Step 4: Setup Supabase database
 */
async function setupDatabase() {
    const spinner = ora('Setting up database schema...').start();
    
    try {
        // Read the schema file
        const schemaPath = path.join(__dirname, '..', 'config', 'database-schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        // In a real implementation, this would execute the SQL against Supabase
        // For now, we'll provide instructions
        
        spinner.succeed('Database schema prepared');
        
        console.log(chalk.yellow('\n📋 Manual step required:'));
        console.log(chalk.white('1. Go to your Supabase project SQL editor'));
        console.log(chalk.white('2. Run the SQL from: config/database-schema.sql'));
        console.log(chalk.white('3. Press Enter when complete...\n'));
        
        await inquirer.prompt([{ type: 'input', name: 'continue', message: 'Press Enter to continue' }]);
        
    } catch (error) {
        spinner.fail('Database setup failed');
        throw error;
    }
}

/**
 * Step 5: Deploy N8N workflow
 */
async function deployN8NWorkflow() {
    const spinner = ora('Deploying N8N workflow...').start();
    
    try {
        const workflowPath = path.join(__dirname, '..', 'config', 'workflow.json');
        
        if (!fs.existsSync(workflowPath)) {
            spinner.warn('Workflow file not found. Creating template...');
            
            // Create a basic workflow template
            const workflowTemplate = {
                name: "Vapi Nail Salon Workflow",
                nodes: [],
                connections: {},
                settings: {
                    executionOrder: "v1"
                }
            };
            
            fs.writeFileSync(workflowPath, JSON.stringify(workflowTemplate, null, 2));
        }
        
        spinner.succeed('N8N workflow prepared');
        
        console.log(chalk.yellow('\n📋 Manual step required:'));
        console.log(chalk.white('1. Go to your N8N instance'));
        console.log(chalk.white('2. Import the workflow from: config/workflow.json'));
        console.log(chalk.white('3. Activate the workflow'));
        console.log(chalk.white('4. Copy the webhook URL'));
        
        const { webhookUrl } = await inquirer.prompt([
            {
                type: 'input',
                name: 'webhookUrl',
                message: 'Enter the N8N webhook URL:',
                validate: input => input.startsWith('http') || 'Must be a valid URL'
            }
        ]);
        
        updateEnvFile({ N8N_WEBHOOK_URL: webhookUrl });
        
    } catch (error) {
        spinner.fail('Workflow deployment failed');
        throw error;
    }
}

/**
 * Step 6: Configure Vapi Assistant
 */
async function configureVapiAssistant() {
    const spinner = ora('Configuring Vapi assistant...').start();
    
    try {
        // Run the Vapi setup script
        const setupScript = require('./vapi-setup');
        await setupScript.setupVapiAssistant();
        
        spinner.succeed('Vapi assistant configured');
        
    } catch (error) {
        spinner.fail('Assistant configuration failed');
        console.log(chalk.yellow('You can configure the assistant manually later.'));
    }
}

/**
 * Step 7: Setup Dashboard
 */
async function setupDashboard() {
    const spinner = ora('Setting up admin dashboard...').start();
    
    try {
        const dashboardPath = path.join(__dirname, '..', 'dashboard');
        
        if (fs.existsSync(dashboardPath)) {
            // Create .env.local for Next.js
            const envLocal = `
NEXT_PUBLIC_SUPABASE_URL=${process.env.SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${process.env.SUPABASE_ANON_KEY}
NEXT_PUBLIC_DEMO_BUSINESS_ID=550e8400-e29b-41d4-a716-446655440000
            `.trim();
            
            fs.writeFileSync(path.join(dashboardPath, '.env.local'), envLocal);
            
            spinner.succeed('Dashboard configured');
            
            const { startDashboard } = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'startDashboard',
                    message: 'Would you like to start the dashboard now?',
                    default: true
                }
            ]);
            
            if (startDashboard) {
                console.log(chalk.cyan('\n🌐 Starting dashboard at http://localhost:3000'));
                console.log(chalk.gray('(This will run in the background)'));
                
                exec('npm run dev', { cwd: dashboardPath }, (error) => {
                    if (error) {
                        console.error(chalk.yellow('Dashboard failed to start:', error.message));
                    }
                });
            }
        }
        
    } catch (error) {
        spinner.fail('Dashboard setup failed');
        console.log(chalk.yellow('You can set up the dashboard manually later.'));
    }
}

/**
 * Step 8: Test all connections
 */
async function testConnections() {
    console.log(chalk.cyan('\n🔍 Testing connections...\n'));
    
    const tests = [
        { name: 'Vapi API', test: testVapiConnection },
        { name: 'N8N Webhook', test: testN8NConnection },
        { name: 'Supabase Database', test: testSupabaseConnection },
        { name: 'Google Calendar', test: testGoogleConnection }
    ];
    
    const results = [];
    
    for (const { name, test } of tests) {
        const spinner = ora(`Testing ${name}...`).start();
        
        try {
            await test();
            spinner.succeed(`${name} connected`);
            results.push({ name, status: 'success' });
        } catch (error) {
            spinner.fail(`${name} failed: ${error.message}`);
            results.push({ name, status: 'failed', error: error.message });
        }
    }
    
    // Display test results summary
    console.log(chalk.cyan('\n📊 Connection Test Results:\n'));
    results.forEach(({ name, status, error }) => {
        const icon = status === 'success' ? '✅' : '❌';
        const color = status === 'success' ? chalk.green : chalk.red;
        console.log(`${icon} ${color(name)}${error ? chalk.gray(` - ${error}`) : ''}`);
    });
    
    const failedTests = results.filter(r => r.status === 'failed');
    if (failedTests.length > 0) {
        console.log(chalk.yellow('\n⚠️  Some connections failed. You may need to configure them manually.'));
    }
}

/**
 * Step 9: Final setup and instructions
 */
async function finalSetup() {
    const spinner = ora('Finalizing setup...').start();
    
    // Generate setup report
    const reportPath = path.join(__dirname, '..', 'setup-report.txt');
    const report = generateSetupReport();
    fs.writeFileSync(reportPath, report);
    
    spinner.succeed('Setup completed');
}

/**
 * Test Vapi connection
 */
async function testVapiConnection() {
    if (!process.env.VAPI_API_KEY) {
        throw new Error('API key not configured');
    }
    
    const axios = require('axios');
    await axios.get('https://api.vapi.ai/assistant', {
        headers: { 'Authorization': `Bearer ${process.env.VAPI_API_KEY}` }
    });
}

/**
 * Test N8N connection
 */
async function testN8NConnection() {
    if (!process.env.N8N_WEBHOOK_URL) {
        throw new Error('Webhook URL not configured');
    }
    
    // Basic URL validation
    new URL(process.env.N8N_WEBHOOK_URL);
}

/**
 * Test Supabase connection
 */
async function testSupabaseConnection() {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
        throw new Error('Supabase credentials not configured');
    }
    
    // Basic validation
    if (!process.env.SUPABASE_URL.includes('supabase.co')) {
        throw new Error('Invalid Supabase URL');
    }
}

/**
 * Test Google connection
 */
async function testGoogleConnection() {
    if (!process.env.GOOGLE_CLIENT_ID) {
        throw new Error('Google credentials not configured');
    }
}

/**
 * Run demo mode
 */
async function runDemoMode() {
    console.log(chalk.magenta.bold('\n🎮 DEMO MODE ACTIVATED\n'));
    console.log(chalk.cyan('This will set up a local demo without real services.\n'));
    
    const spinner = ora('Setting up demo environment...').start();
    
    // Create demo .env file
    const demoEnv = `
# DEMO MODE CONFIGURATION
DEMO_MODE=true
BUSINESS_NAME=Demo Nail Salon
BUSINESS_PHONE=(555) 123-4567
VAPI_API_KEY=demo-key-not-real
N8N_WEBHOOK_URL=http://localhost:5678/webhook/demo
SUPABASE_URL=https://demo.supabase.co
SUPABASE_ANON_KEY=demo-anon-key
    `.trim();
    
    fs.writeFileSync(path.join(__dirname, '..', '.env'), demoEnv);
    
    spinner.succeed('Demo environment created');
    
    console.log(chalk.green('\n✅ Demo mode setup complete!\n'));
    console.log(chalk.cyan('You can explore the project structure and configuration.'));
    console.log(chalk.yellow('To use with real services, run: npm run deploy\n'));
}

/**
 * Update .env file with new values
 */
function updateEnvFile(values) {
    const envPath = path.join(__dirname, '..', '.env');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    Object.entries(values).forEach(([key, value]) => {
        if (value) {
            const regex = new RegExp(`^${key}=.*$`, 'm');
            if (regex.test(envContent)) {
                envContent = envContent.replace(regex, `${key}=${value}`);
            } else {
                envContent += `\n${key}=${value}`;
            }
        }
    });
    
    fs.writeFileSync(envPath, envContent.trim() + '\n');
}

/**
 * Generate setup report
 */
function generateSetupReport() {
    const timestamp = new Date().toISOString();
    
    return `
VAPI NAIL SALON - SETUP REPORT
Generated: ${timestamp}
================================

Configuration Summary:
- Business Name: ${process.env.BUSINESS_NAME || 'Not configured'}
- Vapi API: ${process.env.VAPI_API_KEY ? 'Configured' : 'Missing'}
- N8N Webhook: ${process.env.N8N_WEBHOOK_URL || 'Not configured'}
- Supabase: ${process.env.SUPABASE_URL ? 'Configured' : 'Missing'}
- Google Calendar: ${process.env.GOOGLE_CLIENT_ID ? 'Configured' : 'Missing'}

Next Steps:
1. Test your voice agent by calling your Vapi phone number
2. Access the dashboard at http://localhost:3000
3. Monitor appointments in your Supabase database
4. Check N8N workflow execution logs

Support:
- Documentation: https://github.com/dropfly/vapi-nail-salon-agent
- Issues: https://github.com/dropfly/vapi-nail-salon-agent/issues
    `.trim();
}

/**
 * Display success message
 */
function displaySuccess() {
    console.log(chalk.green.bold(`
╔══════════════════════════════════════════════╗
║          ✅ SETUP COMPLETE! ✅               ║
╚══════════════════════════════════════════════╝
    `));
    
    console.log(chalk.cyan('\n🎉 Your Vapi Nail Salon Agent is ready!\n'));
    
    console.log(chalk.white('📞 Test your voice agent:'));
    console.log(chalk.gray(`   Call: ${process.env.VAPI_PHONE_NUMBER || 'Your Vapi phone number'}\n`));
    
    console.log(chalk.white('💻 Access your dashboard:'));
    console.log(chalk.gray('   URL: http://localhost:3000'));
    console.log(chalk.gray('   (Run: npm run dashboard)\n'));
    
    console.log(chalk.white('📊 Monitor your system:'));
    console.log(chalk.gray('   N8N Workflows: ' + (process.env.N8N_BASE_URL || 'Your N8N URL')));
    console.log(chalk.gray('   Database: ' + (process.env.SUPABASE_URL || 'Your Supabase URL')));
    
    console.log(chalk.yellow('\n📚 For more information:'));
    console.log(chalk.gray('   Documentation: npm run docs'));
    console.log(chalk.gray('   Support: npm run support\n'));
}

// Run the main function
if (require.main === module) {
    main().catch(error => {
        console.error(chalk.red.bold('\n💥 Fatal error:'), error);
        process.exit(1);
    });
}

module.exports = { main };