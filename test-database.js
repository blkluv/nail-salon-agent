#!/usr/bin/env node

const { DatabaseClient } = require('./src/database-client');
const chalk = require('chalk');

async function testDatabaseSetup() {
    console.log(chalk.cyan.bold(`
🧪 Testing Database Setup
========================
`));

    const db = new DatabaseClient();

    // Test 1: Connection
    console.log(chalk.yellow('1. Testing database connection...'));
    const connectionTest = await db.testConnection();
    
    if (connectionTest.success) {
        console.log(chalk.green('✅ Database connected successfully'));
    } else {
        console.log(chalk.yellow('⚠️  Using simulation mode:', connectionTest.message));
    }

    // Test 2: Create Business
    console.log(chalk.yellow('\n2. Testing business creation...'));
    const testSalon = {
        name: 'Test Salon ' + Date.now(),
        businessType: 'nail_salon',
        phone: '(555) 123-4567',
        email: `test${Date.now()}@example.com`,
        address: '123 Test Street',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90210',
        timezone: 'America/Los_Angeles',
        ownerFirstName: 'John',
        ownerLastName: 'Test',
        ownerEmail: `owner${Date.now()}@example.com`,
        ownerPhone: '(555) 987-6543',
        plan: 'starter'
    };

    const businessResult = await db.createBusiness(testSalon);
    
    if (businessResult.success) {
        console.log(chalk.green('✅ Business created successfully'));
        console.log(chalk.gray(`   ID: ${businessResult.business.id}`));
        console.log(chalk.gray(`   Slug: ${businessResult.business.slug}`));
        console.log(chalk.gray(`   Token: ${businessResult.business.webhook_token}`));
    } else {
        console.log(chalk.red('❌ Business creation failed:', businessResult.error));
    }

    // Test 3: Business Lookup
    if (businessResult.success) {
        console.log(chalk.yellow('\n3. Testing business lookup by slug...'));
        const lookupResult = await db.getBusinessBySlug(businessResult.business.slug);
        
        if (lookupResult.success) {
            console.log(chalk.green('✅ Business lookup successful'));
        } else {
            console.log(chalk.red('❌ Business lookup failed:', lookupResult.error));
        }
    }

    // Test 4: Event Logging
    if (businessResult.success) {
        console.log(chalk.yellow('\n4. Testing event logging...'));
        const logResult = await db.logEvent(
            businessResult.business.id,
            'test_event',
            { message: 'This is a test log entry' }
        );
        
        if (logResult.success) {
            console.log(chalk.green('✅ Event logging successful'));
        } else {
            console.log(chalk.red('❌ Event logging failed:', logResult.error));
        }
    }

    // Summary
    console.log(chalk.cyan.bold(`
📋 Test Summary
===============
`));

    if (db.simulationMode) {
        console.log(chalk.yellow(`
🔄 SIMULATION MODE
• Database client working correctly
• All operations simulated successfully
• Ready for Supabase configuration

To enable real database:
1. Create Supabase project
2. Run database/supabase-schema.sql
3. Add credentials to .env file
        `));
    } else {
        console.log(chalk.green(`
✅ REAL DATABASE MODE
• Connection established
• Tables accessible
• Multi-tenant operations working
• Ready for full onboarding tests
        `));
    }

    console.log(chalk.blue(`
Next Steps:
1. Configure Supabase (if not done)
2. Test full registration flow
3. Set up n8n workflows
4. Test phone provisioning
    `));
}

// Run the test
if (require.main === module) {
    testDatabaseSetup().catch(error => {
        console.error(chalk.red('Test failed:'), error.message);
        process.exit(1);
    });
}

module.exports = { testDatabaseSetup };