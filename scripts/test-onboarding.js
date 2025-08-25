#!/usr/bin/env node

const chalk = require('chalk');
const ora = require('ora');
const { AutomatedOnboarding } = require('../src/automated-onboarding');
require('dotenv').config();

/**
 * Comprehensive testing system for automated onboarding
 */
class OnboardingTester {
    constructor() {
        this.results = [];
        this.failures = [];
    }

    async runAllTests() {
        console.log(chalk.cyan.bold(`
🧪 AUTOMATED ONBOARDING TEST SUITE
==================================
Testing the complete salon onboarding process
`));

        await this.validateEnvironment();
        await this.testDatabaseConnection();
        await this.testVapiConnection();
        await this.testFullOnboarding();
        
        this.printTestResults();
    }

    async validateEnvironment() {
        const spinner = ora('Validating environment variables...').start();
        
        const requiredVars = [
            'VAPI_API_KEY',
            'SUPABASE_URL',
            'SUPABASE_SERVICE_ROLE_KEY',
            'N8N_API_URL',
            'N8N_API_KEY'
        ];

        const missing = requiredVars.filter(v => !process.env[v]);
        
        if (missing.length > 0) {
            spinner.fail(`Missing environment variables: ${missing.join(', ')}`);
            this.failures.push({
                test: 'Environment Validation',
                error: `Missing: ${missing.join(', ')}`
            });
        } else {
            spinner.succeed('Environment variables validated');
            this.results.push({
                test: 'Environment Validation',
                status: 'PASS',
                duration: 'Instant'
            });
        }
    }

    async testDatabaseConnection() {
        const spinner = ora('Testing database connection...').start();
        const startTime = Date.now();
        
        try {
            const axios = require('axios');
            
            const response = await axios.get(
                `${process.env.SUPABASE_URL}/rest/v1/businesses?limit=1`,
                {
                    headers: {
                        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
                        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
                    }
                }
            );

            const duration = `${Date.now() - startTime}ms`;
            spinner.succeed(`Database connection successful (${duration})`);
            
            this.results.push({
                test: 'Database Connection',
                status: 'PASS',
                duration: duration
            });

        } catch (error) {
            spinner.fail('Database connection failed');
            this.failures.push({
                test: 'Database Connection',
                error: error.message
            });
        }
    }

    async testVapiConnection() {
        const spinner = ora('Testing Vapi API connection...').start();
        const startTime = Date.now();
        
        try {
            const axios = require('axios');
            
            const response = await axios.get(
                'https://api.vapi.ai/assistant?limit=1',
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.VAPI_API_KEY}`
                    }
                }
            );

            const duration = `${Date.now() - startTime}ms`;
            spinner.succeed(`Vapi API connection successful (${duration})`);
            
            this.results.push({
                test: 'Vapi API Connection',
                status: 'PASS',
                duration: duration
            });

        } catch (error) {
            spinner.fail('Vapi API connection failed');
            this.failures.push({
                test: 'Vapi API Connection',
                error: error.response?.data?.message || error.message
            });
        }
    }

    async testFullOnboarding() {
        const spinner = ora('Testing full salon onboarding process...').start();
        const startTime = Date.now();
        
        try {
            const testSalon = {
                name: `Test Salon ${Date.now()}`,
                phone: '(555) 999-0001',
                email: `test-${Date.now()}@testsalon.com`,
                address: '123 Test Street',
                city: 'Test City',
                state: 'CA',
                zipCode: '90210',
                plan: 'starter'
            };

            const onboarding = new AutomatedOnboarding();
            spinner.text = 'Creating test salon...';
            
            const results = await onboarding.onboardNewSalon(testSalon);
            
            // Validate results
            const validations = [
                { check: 'business.id', value: results.business?.id, required: true },
                { check: 'phoneNumber.number', value: results.phoneNumber?.number, required: true },
                { check: 'assistant.id', value: results.assistant?.id, required: true },
                { check: 'tools.length', value: results.tools?.length, required: true, expected: 4 },
                { check: 'workflow.id', value: results.workflow?.id, required: true }
            ];

            const failedValidations = validations.filter(v => {
                if (v.required && !v.value) return true;
                if (v.expected && v.value !== v.expected) return true;
                return false;
            });

            if (failedValidations.length > 0) {
                throw new Error(`Validation failed: ${failedValidations.map(f => f.check).join(', ')}`);
            }

            const duration = `${Math.floor((Date.now() - startTime) / 1000)}s`;
            spinner.succeed(`Full onboarding test completed successfully (${duration})`);
            
            this.results.push({
                test: 'Full Onboarding Process',
                status: 'PASS',
                duration: duration,
                details: {
                    businessId: results.business.id,
                    phoneNumber: results.phoneNumber?.number,
                    assistantId: results.assistant?.id,
                    toolsCount: results.tools?.length,
                    workflowId: results.workflow?.id
                }
            });

            // Cleanup test data
            await this.cleanupTestData(results);

        } catch (error) {
            spinner.fail('Full onboarding test failed');
            this.failures.push({
                test: 'Full Onboarding Process',
                error: error.message,
                stack: error.stack
            });
        }
    }

    async cleanupTestData(results) {
        const spinner = ora('Cleaning up test data...').start();
        
        try {
            const axios = require('axios');
            
            // Delete in reverse order of creation
            if (results.workflow?.id) {
                await axios.delete(`${process.env.N8N_API_URL}/workflows/${results.workflow.id}`, {
                    headers: { 'X-N8N-API-KEY': process.env.N8N_API_KEY }
                }).catch(() => {});
            }
            
            if (results.assistant?.id) {
                await axios.delete(`https://api.vapi.ai/assistant/${results.assistant.id}`, {
                    headers: { 'Authorization': `Bearer ${process.env.VAPI_API_KEY}` }
                }).catch(() => {});
            }
            
            if (results.tools) {
                for (const tool of results.tools) {
                    await axios.delete(`https://api.vapi.ai/tool/${tool.id}`, {
                        headers: { 'Authorization': `Bearer ${process.env.VAPI_API_KEY}` }
                    }).catch(() => {});
                }
            }
            
            if (results.phoneNumber?.id) {
                await axios.delete(`https://api.vapi.ai/phone-number/${results.phoneNumber.id}`, {
                    headers: { 'Authorization': `Bearer ${process.env.VAPI_API_KEY}` }
                }).catch(() => {});
            }
            
            if (results.business?.id) {
                await axios.delete(`${process.env.SUPABASE_URL}/rest/v1/businesses?id=eq.${results.business.id}`, {
                    headers: {
                        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
                        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
                    }
                }).catch(() => {});
            }
            
            spinner.succeed('Test data cleaned up');
            
        } catch (error) {
            spinner.warn('Some test data may not have been cleaned up');
        }
    }

    printTestResults() {
        console.log(chalk.yellow.bold('\\n📊 TEST RESULTS SUMMARY'));
        console.log(chalk.gray('======================='));
        
        console.log(chalk.green(`✅ PASSED: ${this.results.length}`));
        console.log(chalk.red(`❌ FAILED: ${this.failures.length}`));
        console.log(chalk.blue(`📈 SUCCESS RATE: ${Math.floor((this.results.length / (this.results.length + this.failures.length)) * 100)}%`));
        
        if (this.results.length > 0) {
            console.log(chalk.green.bold('\\n✅ PASSED TESTS:'));
            this.results.forEach(result => {
                console.log(chalk.green(`  • ${result.test} (${result.duration})`));
                if (result.details) {
                    Object.entries(result.details).forEach(([key, value]) => {
                        console.log(chalk.gray(`    ${key}: ${value}`));
                    });
                }
            });
        }
        
        if (this.failures.length > 0) {
            console.log(chalk.red.bold('\\n❌ FAILED TESTS:'));
            this.failures.forEach(failure => {
                console.log(chalk.red(`  • ${failure.test}`));
                console.log(chalk.gray(`    Error: ${failure.error}`));
            });
            
            console.log(chalk.yellow.bold('\\n🔧 TROUBLESHOOTING:'));
            if (this.failures.some(f => f.test.includes('Environment'))) {
                console.log(chalk.white('  • Check your .env file has all required variables'));
            }
            if (this.failures.some(f => f.test.includes('Database'))) {
                console.log(chalk.white('  • Verify Supabase URL and service role key'));
            }
            if (this.failures.some(f => f.test.includes('Vapi'))) {
                console.log(chalk.white('  • Check Vapi API key is valid and has permissions'));
            }
        }
        
        const overallStatus = this.failures.length === 0 ? 'READY FOR PRODUCTION' : 'NEEDS ATTENTION';
        const statusColor = this.failures.length === 0 ? chalk.green.bold : chalk.red.bold;
        
        console.log(statusColor(`\\n🚦 STATUS: ${overallStatus}`));
        
        if (this.failures.length === 0) {
            console.log(chalk.green(`
🎉 All tests passed! Your automated onboarding system is ready to scale.
   
💡 Next steps:
   • Run "npm run demo" to test the full user experience
   • Deploy to production environment
   • Set up monitoring and alerts
            `));
        }
    }
}

async function main() {
    const tester = new OnboardingTester();
    await tester.runAllTests();
}

if (require.main === module) {
    main().catch(error => {
        console.error(chalk.red('Test suite failed:'), error);
        process.exit(1);
    });
}

module.exports = { OnboardingTester };