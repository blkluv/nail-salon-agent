/**
 * Database Client for DropFly AI Salon Platform
 * Handles all Supabase interactions with multi-tenant isolation
 */

const { createClient } = require('@supabase/supabase-js');

class DatabaseClient {
    constructor() {
        // Initialize Supabase client
        if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
            console.warn('⚠️  Supabase not configured - using simulation mode');
            this.supabase = null;
            this.simulationMode = true;
        } else {
            this.supabase = createClient(
                process.env.SUPABASE_URL,
                process.env.SUPABASE_SERVICE_KEY
            );
            this.simulationMode = false;
        }
    }

    async testConnection() {
        if (this.simulationMode) {
            return { success: true, message: 'Simulation mode - no real database' };
        }

        try {
            const { data, error } = await this.supabase
                .from('businesses')
                .select('count(*)')
                .limit(1);

            if (error) throw error;
            
            return { 
                success: true, 
                message: 'Database connected successfully',
                data 
            };
        } catch (error) {
            return { 
                success: false, 
                message: 'Database connection failed', 
                error: error.message 
            };
        }
    }

    /**
     * Create a new business (salon) in the database
     */
    async createBusiness(businessData) {
        if (this.simulationMode) {
            return this.simulateCreateBusiness(businessData);
        }

        try {
            // Generate unique slug
            const slug = await this.generateUniqueSlug(businessData.name);
            
            const business = {
                slug,
                name: businessData.name,
                business_type: businessData.businessType || 'nail_salon',
                phone: businessData.phone,
                email: businessData.email,
                address: businessData.address,
                city: businessData.city,
                state: businessData.state,
                zip_code: businessData.zipCode,
                timezone: businessData.timezone || 'America/Los_Angeles',
                
                owner_first_name: businessData.ownerFirstName,
                owner_last_name: businessData.ownerLastName,
                owner_email: businessData.ownerEmail,
                owner_phone: businessData.ownerPhone,
                
                plan_type: businessData.plan || 'starter',
                subscription_status: 'trial',
                trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                
                settings: {
                    created_from: 'automated_onboarding',
                    onboarding_version: '1.0'
                }
            };

            const { data, error } = await this.supabase
                .from('businesses')
                .insert([business])
                .select()
                .single();

            if (error) throw error;

            // Seed default data
            await this.seedDefaultServices(data.id);
            await this.seedDefaultHours(data.id);

            return { success: true, business: data };

        } catch (error) {
            console.error('Failed to create business:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Update business with Vapi integration details
     */
    async updateBusinessVapiInfo(businessId, vapiData) {
        if (this.simulationMode) {
            console.log('📝 [SIMULATION] Updated business with Vapi data:', vapiData);
            return { success: true };
        }

        try {
            const { data, error } = await this.supabase
                .from('businesses')
                .update({
                    vapi_assistant_id: vapiData.assistantId,
                    vapi_phone_number: vapiData.phoneNumber,
                    twilio_phone_sid: vapiData.phoneSid,
                    n8n_workflow_id: vapiData.workflowId,
                    updated_at: new Date().toISOString()
                })
                .eq('id', businessId)
                .select()
                .single();

            if (error) throw error;

            return { success: true, business: data };

        } catch (error) {
            console.error('Failed to update business Vapi info:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get business by slug (for webhook routing)
     */
    async getBusinessBySlug(slug) {
        if (this.simulationMode) {
            return {
                success: true,
                business: {
                    id: 'demo-business-id',
                    slug: slug,
                    name: 'Demo Salon',
                    vapi_assistant_id: 'demo-assistant',
                    webhook_token: 'demo-token'
                }
            };
        }

        try {
            const { data, error } = await this.supabase
                .from('businesses')
                .select('*')
                .eq('slug', slug)
                .single();

            if (error) throw error;

            return { success: true, business: data };

        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get business by webhook token (for API authentication)
     */
    async getBusinessByToken(token) {
        if (this.simulationMode) {
            return {
                success: true,
                business: {
                    id: 'demo-business-id',
                    name: 'Demo Salon',
                    webhook_token: token
                }
            };
        }

        try {
            const { data, error } = await this.supabase
                .from('businesses')
                .select('*')
                .eq('webhook_token', token)
                .single();

            if (error) throw error;

            return { success: true, business: data };

        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Create appointment booking
     */
    async createAppointment(businessId, appointmentData) {
        if (this.simulationMode) {
            console.log('📅 [SIMULATION] Created appointment:', appointmentData);
            return { 
                success: true, 
                appointment: { 
                    id: 'demo-appointment-' + Date.now(),
                    ...appointmentData 
                }
            };
        }

        try {
            // First, get or create customer
            const customer = await this.getOrCreateCustomer(businessId, {
                first_name: appointmentData.customerFirstName,
                last_name: appointmentData.customerLastName,
                phone: appointmentData.customerPhone,
                email: appointmentData.customerEmail
            });

            const appointment = {
                business_id: businessId,
                customer_id: customer.id,
                appointment_date: appointmentData.date,
                start_time: appointmentData.startTime,
                duration_minutes: appointmentData.duration || 30,
                customer_name: `${appointmentData.customerFirstName} ${appointmentData.customerLastName}`,
                customer_phone: appointmentData.customerPhone,
                customer_email: appointmentData.customerEmail,
                customer_notes: appointmentData.notes,
                booking_source: appointmentData.source || 'phone',
                status: 'scheduled'
            };

            const { data, error } = await this.supabase
                .from('appointments')
                .insert([appointment])
                .select()
                .single();

            if (error) throw error;

            return { success: true, appointment: data };

        } catch (error) {
            console.error('Failed to create appointment:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Log system events
     */
    async logEvent(businessId, eventType, eventData, success = true, errorMessage = null) {
        if (this.simulationMode) {
            console.log(`📊 [SIMULATION] ${eventType}:`, eventData);
            return { success: true };
        }

        try {
            const logEntry = {
                business_id: businessId,
                event_type: eventType,
                event_data: eventData,
                source: 'automated_onboarding',
                success,
                error_message: errorMessage
            };

            const { error } = await this.supabase
                .from('system_logs')
                .insert([logEntry]);

            if (error) throw error;

            return { success: true };

        } catch (error) {
            console.error('Failed to log event:', error);
            return { success: false, error: error.message };
        }
    }

    // ==============================================
    // PRIVATE HELPER METHODS
    // ==============================================

    async generateUniqueSlug(name) {
        if (this.simulationMode) {
            return name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
        }

        const baseSlug = name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '');

        let slug = baseSlug;
        let counter = 1;

        while (true) {
            const { data } = await this.supabase
                .from('businesses')
                .select('slug')
                .eq('slug', slug)
                .limit(1);

            if (!data || data.length === 0) {
                return slug;
            }

            slug = `${baseSlug}-${counter}`;
            counter++;
        }
    }

    async getOrCreateCustomer(businessId, customerData) {
        // Try to find existing customer by phone
        const { data: existing } = await this.supabase
            .from('customers')
            .select('*')
            .eq('business_id', businessId)
            .eq('phone', customerData.phone)
            .limit(1);

        if (existing && existing.length > 0) {
            return existing[0];
        }

        // Create new customer
        const { data, error } = await this.supabase
            .from('customers')
            .insert([{
                business_id: businessId,
                first_name: customerData.first_name,
                last_name: customerData.last_name,
                phone: customerData.phone,
                email: customerData.email
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async seedDefaultServices(businessId) {
        if (this.simulationMode) return { success: true };

        const { error } = await this.supabase
            .rpc('seed_default_services', { business_uuid: businessId });

        if (error) {
            console.error('Failed to seed default services:', error);
        }
        return { success: !error };
    }

    async seedDefaultHours(businessId) {
        if (this.simulationMode) return { success: true };

        const { error } = await this.supabase
            .rpc('seed_default_hours', { business_uuid: businessId });

        if (error) {
            console.error('Failed to seed default hours:', error);
        }
        return { success: !error };
    }

    // Simulation mode fallback
    simulateCreateBusiness(businessData) {
        const slug = businessData.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        
        return {
            success: true,
            business: {
                id: 'demo-business-' + Date.now(),
                slug: slug,
                name: businessData.name,
                email: businessData.email,
                phone: businessData.phone,
                owner_email: businessData.ownerEmail,
                plan_type: businessData.plan || 'starter',
                webhook_token: 'demo-token-' + Math.random().toString(36).substr(2, 9),
                trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                created_at: new Date().toISOString()
            }
        };
    }
}

module.exports = { DatabaseClient };