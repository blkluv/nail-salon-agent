#!/usr/bin/env node

/**
 * Simple Demo Test - Database Only
 * Tests salon registration without phone provisioning
 */

const { createClient } = require('@supabase/supabase-js');
const chalk = require('chalk');
require('dotenv').config();

async function simpleDemoTest() {
    console.log(chalk.blue.bold('🎮 Simple Demo Test - Database Only\n'));

    try {
        // Initialize Supabase client
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_KEY
        );

        console.log('📊 Creating demo salon...');

        // Create demo business
        const demoSalon = {
            name: 'Sparkle Nails Demo',
            slug: 'sparkle-nails-demo',
            email: 'demo@sparklenails.com',
            phone: '(555) 123-4567',
            address: '123 Demo Street, Demo City, CA 90210',
            city: 'Demo City',
            state: 'CA',
            zip_code: '90210',
            owner_first_name: 'Demo',
            owner_last_name: 'Owner',
            owner_email: 'owner@sparklenails.com',
            owner_phone: '(555) 123-4568',
            business_type: 'nail_salon',
            plan_type: 'starter'
        };

        // Insert business
        const { data: business, error: businessError } = await supabase
            .from('businesses')
            .upsert([demoSalon], { 
                onConflict: 'email',
                ignoreDuplicates: false 
            })
            .select()
            .single();

        if (businessError) {
            throw new Error(`Business creation failed: ${businessError.message}`);
        }

        console.log(chalk.green('✅ Demo salon created successfully!'));
        console.log(`   • Business ID: ${business.id}`);
        console.log(`   • Slug: ${business.slug}`);
        console.log(`   • Webhook Token: ${business.webhook_token}`);

        // Seed default services
        console.log('💅 Adding default services...');
        
        const defaultServices = [
            { name: 'Basic Manicure', description: 'Classic nail care and polish', duration_minutes: 30, price_cents: 2500, category: 'manicure' },
            { name: 'Gel Manicure', description: 'Long-lasting gel polish', duration_minutes: 45, price_cents: 3500, category: 'manicure' },
            { name: 'Basic Pedicure', description: 'Relaxing foot care and polish', duration_minutes: 45, price_cents: 3000, category: 'pedicure' },
            { name: 'Acrylic Full Set', description: 'Full set of acrylic nails', duration_minutes: 90, price_cents: 6000, category: 'extensions' }
        ].map(service => ({ ...service, business_id: business.id }));

        const { error: servicesError } = await supabase
            .from('services')
            .insert(defaultServices);

        if (servicesError) {
            console.log(chalk.yellow('⚠️  Services already exist, skipping...'));
        } else {
            console.log(chalk.green('✅ Default services added!'));
        }

        // Add demo staff
        console.log('👩‍💼 Adding demo staff...');
        
        const demoStaff = {
            business_id: business.id,
            first_name: 'Sarah',
            last_name: 'Johnson',
            email: 'sarah@sparklenails.com',
            phone: '(555) 123-4569',
            specialties: ['manicure', 'pedicure'],
            is_active: true
        };

        const { error: staffError } = await supabase
            .from('staff')
            .upsert([demoStaff], { onConflict: 'business_id,email' });

        if (staffError) {
            console.log(chalk.yellow('⚠️  Staff already exists, skipping...'));
        } else {
            console.log(chalk.green('✅ Demo staff added!'));
        }

        // Add business hours
        console.log('🕒 Setting business hours...');
        
        const businessHours = [
            { day_of_week: 0, is_closed: true },  // Sunday
            { day_of_week: 1, is_closed: true },  // Monday
            { day_of_week: 2, open_time: '09:00', close_time: '19:00', is_closed: false }, // Tuesday
            { day_of_week: 3, open_time: '09:00', close_time: '19:00', is_closed: false }, // Wednesday
            { day_of_week: 4, open_time: '09:00', close_time: '19:00', is_closed: false }, // Thursday
            { day_of_week: 5, open_time: '09:00', close_time: '19:00', is_closed: false }, // Friday
            { day_of_week: 6, open_time: '09:00', close_time: '18:00', is_closed: false }  // Saturday
        ].map(hours => ({ ...hours, business_id: business.id }));

        const { error: hoursError } = await supabase
            .from('business_hours')
            .upsert(businessHours, { onConflict: 'business_id,day_of_week' });

        if (hoursError) {
            console.log(chalk.yellow('⚠️  Business hours already set, skipping...'));
        } else {
            console.log(chalk.green('✅ Business hours configured!'));
        }

        // Create a demo customer and appointment
        console.log('👤 Adding demo customer and appointment...');
        
        const demoCustomer = {
            business_id: business.id,
            first_name: 'Emma',
            last_name: 'Wilson',
            phone: '(555) 987-6543',
            email: 'emma@example.com',
            notes: 'Prefers gel manicures'
        };

        const { data: customer, error: customerError } = await supabase
            .from('customers')
            .upsert([demoCustomer], { onConflict: 'business_id,phone' })
            .select()
            .single();

        if (customerError) {
            console.log(chalk.yellow('⚠️  Customer already exists, using existing...'));
            const { data: existingCustomer } = await supabase
                .from('customers')
                .select('*')
                .eq('business_id', business.id)
                .eq('phone', demoCustomer.phone)
                .single();
            customer = existingCustomer;
        } else {
            console.log(chalk.green('✅ Demo customer added!'));
        }

        // Get a service for the appointment
        const { data: service } = await supabase
            .from('services')
            .select('*')
            .eq('business_id', business.id)
            .limit(1)
            .single();

        // Create tomorrow's appointment
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const appointmentDate = tomorrow.toISOString().split('T')[0];

        const demoAppointment = {
            business_id: business.id,
            customer_id: customer.id,
            service_id: service.id,
            appointment_date: appointmentDate,
            start_time: '14:00',
            duration_minutes: 45,
            status: 'scheduled',
            customer_name: `${demoCustomer.first_name} ${demoCustomer.last_name}`,
            customer_phone: demoCustomer.phone,
            customer_email: demoCustomer.email,
            customer_notes: 'First time customer',
            booking_source: 'demo'
        };

        const { error: appointmentError } = await supabase
            .from('appointments')
            .insert([demoAppointment]);

        if (appointmentError) {
            console.log(chalk.yellow('⚠️  Demo appointment creation failed, continuing...'));
        } else {
            console.log(chalk.green('✅ Demo appointment scheduled for tomorrow!'));
        }

        // Show summary
        console.log(chalk.green.bold('\n🎉 Demo Setup Complete!\n'));
        console.log('📊 What was created:');
        console.log(`   • Business: ${business.name}`);
        console.log(`   • Services: 4 default nail services`);
        console.log(`   • Staff: 1 technician (Sarah Johnson)`);
        console.log(`   • Customer: Emma Wilson`);
        console.log(`   • Appointment: Tomorrow at 2:00 PM`);
        console.log(`   • Business Hours: Tue-Sat, 9AM-7PM`);

        console.log(chalk.blue.bold('\n🚀 Next Steps:'));
        console.log('1. Start the dashboard: npm run dashboard');
        console.log('2. View your demo salon in the admin panel');
        console.log('3. Test creating more appointments');
        console.log('4. Configure your Vapi phone number for voice bookings');

        console.log(chalk.yellow.bold('\n🔗 Useful Info:'));
        console.log(`   • Business ID: ${business.id}`);
        console.log(`   • Webhook Token: ${business.webhook_token}`);
        console.log(`   • Database: ${process.env.SUPABASE_URL}`);

    } catch (error) {
        console.error(chalk.red('\n❌ Demo test failed:'), error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    simpleDemoTest();
}

module.exports = simpleDemoTest;