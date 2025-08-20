#!/usr/bin/env node

const chalk = require('chalk');
const ora = require('ora');
const axios = require('axios');
require('dotenv').config();

console.log(chalk.cyan.bold(`
🧪 Vapi Nail Salon Agent Testing
================================
`));

class SystemTester {
    constructor() {
        this.config = {
            webhook: {
                url: process.env.WEBHOOK_URL,
                token: process.env.WEBHOOK_AUTH_TOKEN
            },
            vapi: {
                apiKey: process.env.VAPI_API_KEY,
                assistantId: process.env.VAPI_ASSISTANT_ID
            }
        };
        
        this.testResults = {
            passed: 0,
            failed: 0,
            tests: []
        };
    }

    async runAllTests() {
        console.log(chalk.yellow('🚀 Running system tests...\\n'));

        const tests = [
            { name: 'Webhook Connectivity', test: () => this.testWebhookConnectivity() },
            { name: 'Check Availability Function', test: () => this.testCheckAvailability() },
            { name: 'Book Appointment Function', test: () => this.testBookAppointment() },
            { name: 'Check Appointments Function', test: () => this.testCheckAppointments() },
            { name: 'Cancel Appointment Function', test: () => this.testCancelAppointment() },
            { name: 'Vapi Assistant Status', test: () => this.testVapiAssistant() }
        ];

        for (const { name, test } of tests) {
            await this.runTest(name, test);
        }

        this.printResults();
    }

    async runTest(name, testFunction) {
        const spinner = ora(`Testing ${name}...`).start();
        
        try {
            const result = await testFunction();
            spinner.succeed(`${name} ✅`);
            this.testResults.passed++;
            this.testResults.tests.push({ name, status: 'passed', result });
        } catch (error) {
            spinner.fail(`${name} ❌`);
            this.testResults.failed++;
            this.testResults.tests.push({ 
                name, 
                status: 'failed', 
                error: error.message,
                details: error.response?.data 
            });
        }
    }

    async testWebhookConnectivity() {
        if (!this.config.webhook.url) {
            throw new Error('Webhook URL not configured');
        }

        const response = await axios.get(this.config.webhook.url.replace('/webhook/', '/health'), {
            timeout: 5000
        });

        return { status: 'reachable', url: this.config.webhook.url };
    }

    async testCheckAvailability() {
        const testData = {
            tool: 'check_availability',
            parameters: {
                service_type: 'manicure_signature',
                preferred_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
                preferred_time: 'any'
            }
        };

        const response = await this.callWebhook(testData);
        
        if (!response.success) {
            throw new Error('Availability check failed');
        }

        return { 
            available_slots: response.available_slots?.length || 0,
            message: response.message 
        };
    }

    async testBookAppointment() {
        const testData = {
            tool: 'book_appointment',
            parameters: {
                customer_name: 'Test Customer',
                customer_email: 'test@example.com',
                customer_phone: '555-0123',
                service_type: 'manicure_signature',
                appointment_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Next week
                start_time: '10:00',
                service_duration: 60,
                service_price: 45
            }
        };

        const response = await this.callWebhook(testData);
        
        if (!response.success && !response.booking_id) {
            throw new Error('Booking test failed');
        }

        // Store booking ID for cancel test
        this.testBookingId = response.booking_id;

        return { 
            booking_id: response.booking_id,
            status: response.success ? 'booked' : 'failed'
        };
    }

    async testCheckAppointments() {
        const testData = {
            tool: 'check_appointments',
            parameters: {
                customer_email: 'test@example.com',
                date_range: 'upcoming'
            }
        };

        const response = await this.callWebhook(testData);
        
        return { 
            total_appointments: response.total_appointments || 0,
            upcoming_appointments: response.upcoming_appointments?.length || 0
        };
    }

    async testCancelAppointment() {
        if (!this.testBookingId) {
            // Create a test booking first
            await this.testBookAppointment();
        }

        const testData = {
            tool: 'cancel_appointment',
            parameters: {
                customer_email: 'test@example.com',
                booking_id: this.testBookingId,
                cancellation_reason: 'Test cancellation'
            }
        };

        const response = await this.callWebhook(testData);
        
        return { 
            cancelled: response.success || false,
            message: response.message 
        };
    }

    async testVapiAssistant() {
        if (!this.config.vapi.apiKey || !this.config.vapi.assistantId) {
            throw new Error('Vapi configuration incomplete');
        }

        const response = await axios.get(
            `https://api.vapi.ai/assistant/${this.config.vapi.assistantId}`,
            {
                headers: { 'Authorization': `Bearer ${this.config.vapi.apiKey}` }
            }
        );

        return { 
            assistant_id: response.data.id,
            name: response.data.name,
            status: 'active'
        };
    }

    async callWebhook(data) {
        const response = await axios.post(
            this.config.webhook.url,
            data,
            {
                headers: {
                    'Authorization': `Bearer ${this.config.webhook.token}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );

        return response.data;
    }

    printResults() {
        console.log(chalk.blue('\\n📊 Test Results:'));
        console.log(chalk.green(`✅ Passed: ${this.testResults.passed}`));
        console.log(chalk.red(`❌ Failed: ${this.testResults.failed}`));
        
        if (this.testResults.failed > 0) {
            console.log(chalk.red('\\n❌ Failed Tests:'));
            this.testResults.tests
                .filter(test => test.status === 'failed')
                .forEach(test => {
                    console.log(chalk.red(`   • ${test.name}: ${test.error}`));
                    if (test.details) {
                        console.log(chalk.gray(`     Details: ${JSON.stringify(test.details, null, 2)}`));
                    }
                });
        }

        if (this.testResults.passed > 0) {
            console.log(chalk.green('\\n✅ Passed Tests:'));
            this.testResults.tests
                .filter(test => test.status === 'passed')
                .forEach(test => {
                    console.log(chalk.green(`   • ${test.name}`));
                });
        }

        const allPassed = this.testResults.failed === 0;
        
        console.log(chalk.cyan('\\n🎯 Status:'));
        if (allPassed) {
            console.log(chalk.green.bold('🎉 All tests passed! Your system is ready.'));
            console.log(chalk.white('\\n📞 Next steps:'));
            console.log(chalk.white('   • Call your Vapi phone number'));
            console.log(chalk.white('   • Try booking an appointment via voice'));
            console.log(chalk.white('   • Check your calendar and email for confirmations'));
        } else {
            console.log(chalk.red.bold('⚠️ Some tests failed. Please check your configuration.'));
            console.log(chalk.white('\\n🔧 Troubleshooting:'));
            console.log(chalk.white('   • Review your .env file'));
            console.log(chalk.white('   • Check service credentials'));
            console.log(chalk.white('   • Verify webhook connectivity'));
        }
    }
}

async function main() {
    try {
        const tester = new SystemTester();
        await tester.runAllTests();
    } catch (error) {
        console.error(chalk.red('❌ Testing failed:'), error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = SystemTester;