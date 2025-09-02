#!/usr/bin/env node

/**
 * Create a neutral demo business for testing and onboarding previews
 * This ensures we never default to a real customer's business
 */

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://irvyhhkoiyzartmmvbxw.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlydnloaGtvaXl6YXJ0bW12Ynh3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTExODI5MywiZXhwIjoyMDcwNjk0MjkzfQ.61Zfyc87GpmpIlWFL1fyX6wcfydqCu6DUFuHnpNSvhk');

async function createDemoBusiness() {
    console.log('🏗️ Creating neutral demo business for multi-tenant testing...');
    
    const demoBusinessId = '00000000-0000-0000-0000-000000000000'; // Neutral demo business UUID
    
    try {
        // Check if demo business already exists
        const { data: existing } = await supabase
            .from('businesses')
            .select('id, name')
            .eq('id', demoBusinessId)
            .single();
            
        if (existing) {
            console.log('✅ Demo business already exists:', existing.name);
            return demoBusinessId;
        }
        
        // Create demo business
        const { data: demoBusiness, error: businessError } = await supabase
            .from('businesses')
            .insert({
                id: demoBusinessId,
                name: 'Demo Beauty Salon',
                slug: 'demo-beauty-salon',
                business_type: 'beauty_salon',
                phone: '(555) 123-DEMO',
                email: 'demo@example.com',
                website: 'https://demo.example.com',
                address_line1: '123 Demo Street',
                city: 'Demo City',
                state: 'Demo State',
                postal_code: '12345',
                country: 'United States',
                timezone: 'America/New_York',
                subscription_tier: 'starter',
                subscription_status: 'active',
                owner_first_name: 'Demo',
                owner_last_name: 'Owner',
                owner_email: 'demo@example.com'
            })
            .select()
            .single();
            
        if (businessError) {
            console.error('❌ Error creating demo business:', businessError);
            throw businessError;
        }
        
        console.log('✅ Demo business created:', demoBusiness.name);
        
        // Create demo services
        const demoServices = [
            {
                business_id: demoBusinessId,
                name: 'Classic Manicure',
                description: 'Traditional nail care and polish application',
                duration_minutes: 30,
                base_price: 25.00,
                category: 'manicure',
                display_order: 1,
                is_active: true
            },
            {
                business_id: demoBusinessId,
                name: 'Gel Manicure', 
                description: 'Long-lasting gel polish manicure',
                duration_minutes: 45,
                base_price: 35.00,
                category: 'manicure',
                display_order: 2,
                is_active: true
            },
            {
                business_id: demoBusinessId,
                name: 'Classic Pedicure',
                description: 'Relaxing foot care and polish',
                duration_minutes: 45,
                base_price: 35.00,
                category: 'pedicure', 
                display_order: 3,
                is_active: true
            }
        ];
        
        const { data: services, error: servicesError } = await supabase
            .from('services')
            .insert(demoServices)
            .select();
            
        if (servicesError) {
            console.warn('⚠️ Error creating demo services:', servicesError);
        } else {
            console.log('✅ Demo services created:', services.length);
        }
        
        // Create demo staff
        const { data: staff, error: staffError } = await supabase
            .from('staff')
            .insert({
                business_id: demoBusinessId,
                first_name: 'Sarah',
                last_name: 'Demo',
                role: 'manager',
                email: 'sarah@demo.example.com',
                phone: '(555) 123-4567',
                is_active: true,
                specialties: ['manicures', 'pedicures']
            })
            .select()
            .single();
            
        if (staffError) {
            console.warn('⚠️ Error creating demo staff:', staffError);
        } else {
            console.log('✅ Demo staff created:', staff.first_name, staff.last_name);
        }
        
        // Create demo business hours
        const businessHours = [
            { business_id: demoBusinessId, day_of_week: 1, is_closed: false, open_time: '09:00', close_time: '18:00' }, // Monday
            { business_id: demoBusinessId, day_of_week: 2, is_closed: false, open_time: '09:00', close_time: '18:00' }, // Tuesday  
            { business_id: demoBusinessId, day_of_week: 3, is_closed: false, open_time: '09:00', close_time: '18:00' }, // Wednesday
            { business_id: demoBusinessId, day_of_week: 4, is_closed: false, open_time: '09:00', close_time: '18:00' }, // Thursday
            { business_id: demoBusinessId, day_of_week: 5, is_closed: false, open_time: '09:00', close_time: '18:00' }, // Friday
            { business_id: demoBusinessId, day_of_week: 6, is_closed: false, open_time: '10:00', close_time: '16:00' }, // Saturday
            { business_id: demoBusinessId, day_of_week: 0, is_closed: true, open_time: null, close_time: null }        // Sunday
        ];
        
        const { error: hoursError } = await supabase
            .from('business_hours')
            .insert(businessHours);
            
        if (hoursError) {
            console.warn('⚠️ Error creating demo business hours:', hoursError);
        } else {
            console.log('✅ Demo business hours created');
        }
        
        console.log('\\n🎯 Demo Business Setup Complete:');
        console.log('   ID:', demoBusinessId);
        console.log('   Name:', demoBusiness.name);
        console.log('   Email:', demoBusiness.email);
        console.log('   Use this for testing and onboarding previews');
        
        return demoBusinessId;
        
    } catch (error) {
        console.error('❌ Error creating demo business:', error);
        throw error;
    }
}

createDemoBusiness();