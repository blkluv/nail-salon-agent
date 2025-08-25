#!/usr/bin/env node

/**
 * Debug Dashboard Connection
 * Test exactly what the dashboard is trying to fetch
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function debugDashboard() {
    console.log('🔍 Debugging Dashboard Connection\n');

    // Use the same config as dashboard
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    const businessId = '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad';

    console.log('Config:');
    console.log(`  URL: ${supabaseUrl}`);
    console.log(`  Anon Key: ${supabaseAnonKey?.substring(0, 20)}...`);
    console.log(`  Business ID: ${businessId}\n`);

    // Test with anon key (same as dashboard)
    const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);

    try {
        console.log('Testing with ANON key (same as dashboard):');
        
        const { data, error } = await supabaseAnon
            .from('businesses')
            .select('*')
            .eq('id', businessId)
            .single();

        if (error) {
            console.log('❌ ANON key error:', error.message);
            console.log('   Code:', error.code);
            console.log('   Details:', error.details);
            console.log('   Hint:', error.hint);
        } else {
            console.log('✅ ANON key success! Business found:', data.name);
        }

    } catch (error) {
        console.log('❌ Exception:', error.message);
    }

    console.log('\n---\n');

    // Test with service key
    const supabaseService = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_KEY);

    try {
        console.log('Testing with SERVICE key:');
        
        const { data, error } = await supabaseService
            .from('businesses')
            .select('*')
            .eq('id', businessId)
            .single();

        if (error) {
            console.log('❌ SERVICE key error:', error.message);
        } else {
            console.log('✅ SERVICE key success! Business found:', data.name);
        }

    } catch (error) {
        console.log('❌ Exception:', error.message);
    }
}

debugDashboard().catch(console.error);