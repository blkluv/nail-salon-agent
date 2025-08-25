#!/usr/bin/env node

/**
 * Quick Database Test Script
 * Tests Supabase connection and basic operations
 */

const { createClient } = require('@supabase/supabase-js');
const chalk = require('chalk');
require('dotenv').config();

async function testDatabase() {
    console.log(chalk.blue.bold('🗄️  Database Connection Test\n'));

    // Check environment variables
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
        console.log(chalk.red('❌ Missing Supabase environment variables'));
        console.log('Please check your .env file for:');
        console.log('  • SUPABASE_URL');
        console.log('  • SUPABASE_SERVICE_KEY');
        process.exit(1);
    }

    try {
        // Initialize Supabase client
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_KEY
        );

        console.log('📡 Testing connection...');

        // Test 1: Basic connection
        const { data: connectionTest, error: connectionError } = await supabase
            .from('businesses')
            .select('count')
            .limit(1);

        if (connectionError) {
            if (connectionError.message.includes('relation "businesses" does not exist')) {
                console.log(chalk.yellow('⚠️  Connected, but schema not applied yet'));
                console.log('Run: npm run production-setup');
                return;
            }
            throw connectionError;
        }

        console.log(chalk.green('✅ Database connection successful'));

        // Test 2: Count records
        const { count: businessCount } = await supabase
            .from('businesses')
            .select('*', { count: 'exact', head: true });

        const { count: appointmentCount } = await supabase
            .from('appointments')
            .select('*', { count: 'exact', head: true });

        console.log(`📊 Database Status:`);
        console.log(`   • Businesses: ${businessCount || 0}`);
        console.log(`   • Appointments: ${appointmentCount || 0}`);

        // Test 3: Insert and delete test record
        console.log('🧪 Testing write operations...');
        
        const testBusiness = {
            name: 'Test Salon (DELETE ME)',
            email: 'test@delete.me',
            slug: 'test-salon-delete-me'
        };

        const { data: insertData, error: insertError } = await supabase
            .from('businesses')
            .insert([testBusiness])
            .select()
            .single();

        if (insertError) throw insertError;

        console.log(chalk.green('✅ Insert operation successful'));

        // Clean up test record
        const { error: deleteError } = await supabase
            .from('businesses')
            .delete()
            .eq('id', insertData.id);

        if (deleteError) throw deleteError;

        console.log(chalk.green('✅ Delete operation successful'));

        console.log(chalk.green.bold('\n🎉 All database tests passed!'));
        console.log('Your Supabase database is ready for production.');

    } catch (error) {
        console.log(chalk.red('❌ Database test failed:'));
        console.log(chalk.red(error.message));
        
        if (error.message.includes('Invalid API key')) {
            console.log(chalk.yellow('\n💡 Check your SUPABASE_SERVICE_KEY in .env file'));
        }
        
        process.exit(1);
    }
}

if (require.main === module) {
    testDatabase();
}

module.exports = testDatabase;