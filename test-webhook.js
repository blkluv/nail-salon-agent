#!/usr/bin/env node

/**
 * Test Webhook Functionality
 * Simulates Vapi calls to test our webhook server
 */

const axios = require('axios');
const chalk = require('chalk');

const WEBHOOK_URL = 'http://localhost:3001/webhook/vapi';

async function testWebhook() {
    console.log(chalk.blue.bold('🧪 Testing Webhook Server\n'));

    // Test 1: Check Availability
    console.log(chalk.yellow('📅 Test 1: Checking availability for tomorrow...'));
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    try {
        const availabilityTest = {
            message: {
                toolCalls: [{
                    function: {
                        name: 'check_availability',
                        arguments: {
                            service_type: 'manicure_gel',
                            preferred_date: tomorrowStr,
                            preferred_time: 'afternoon'
                        }
                    }
                }]
            }
        };

        const response1 = await axios.post(WEBHOOK_URL, availabilityTest);
        console.log(chalk.green('✅ Availability response:'));
        console.log(JSON.stringify(response1.data, null, 2));
        
    } catch (error) {
        console.log(chalk.red('❌ Availability test failed:'), error.message);
    }

    console.log('\n---\n');

    // Test 2: Book Appointment
    console.log(chalk.yellow('📝 Test 2: Booking a test appointment...'));
    
    try {
        const bookingTest = {
            message: {
                toolCalls: [{
                    function: {
                        name: 'book_appointment',
                        arguments: {
                            customer_name: 'Test Customer',
                            customer_email: 'test@example.com',
                            customer_phone: '(555) 000-0001',
                            service_type: 'manicure_gel',
                            appointment_date: tomorrowStr,
                            start_time: '14:00',
                            service_duration: 45
                        }
                    }
                }]
            }
        };

        const response2 = await axios.post(WEBHOOK_URL, bookingTest);
        console.log(chalk.green('✅ Booking response:'));
        console.log(JSON.stringify(response2.data, null, 2));
        
    } catch (error) {
        console.log(chalk.red('❌ Booking test failed:'), error.message);
    }

    console.log('\n---\n');

    // Test 3: Check Appointments
    console.log(chalk.yellow('🔍 Test 3: Checking appointments...'));
    
    try {
        const checkTest = {
            message: {
                toolCalls: [{
                    function: {
                        name: 'check_appointments',
                        arguments: {
                            customer_phone: '(555) 000-0001',
                            date_range: 'upcoming'
                        }
                    }
                }]
            }
        };

        const response3 = await axios.post(WEBHOOK_URL, checkTest);
        console.log(chalk.green('✅ Check appointments response:'));
        console.log(JSON.stringify(response3.data, null, 2));
        
    } catch (error) {
        console.log(chalk.red('❌ Check appointments test failed:'), error.message);
    }

    console.log(chalk.green.bold('\n🎉 Webhook tests complete!'));
    console.log('\nIf all tests passed, your webhook is ready for Vapi integration.');
    console.log('Next step: Update your Vapi assistant with the webhook URL.');
}

testWebhook().catch(console.error);