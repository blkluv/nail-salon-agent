/**
 * Business Context Injection Service
 * Dynamically injects business-specific data into Vapi assistant responses
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://irvyhhkoiyzartmmvbxw.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlydnloaGtvaXl6YXJ0bW12Ynh3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTExODI5MywiZXhwIjoyMDcwNjk0MjkzfQ.61Zfyc87GpmpIlWFL1fyX6wcfydqCu6DUFuHnpNSvhk';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

class BusinessContextInjector {
    constructor() {
        this.cache = new Map(); // Cache business data for 5 minutes
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Fetch comprehensive business data for context injection
     */
    async fetchBusinessContext(businessId) {
        const cacheKey = `business_${businessId}`;
        const cached = this.cache.get(cacheKey);
        
        if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
            return cached.data;
        }

        try {
            console.log(`🏢 Fetching business context for: ${businessId}`);

            // Fetch business details
            const { data: business } = await supabase
                .from('businesses')
                .select(`
                    id, name, phone, email, website,
                    address_line1, city, state, postal_code, country,
                    subscription_tier, timezone
                `)
                .eq('id', businessId)
                .single();

            if (!business) {
                throw new Error(`Business not found: ${businessId}`);
            }

            // Fetch services
            const { data: services } = await supabase
                .from('services')
                .select('id, name, description, duration_minutes, base_price, category, requires_deposit, deposit_amount')
                .eq('business_id', businessId)
                .eq('is_active', true)
                .order('display_order', { ascending: true });

            // Fetch staff
            const { data: staff } = await supabase
                .from('staff')
                .select('id, first_name, last_name, role, specialties, is_active')
                .eq('business_id', businessId)
                .eq('is_active', true)
                .order('first_name');

            // Fetch business hours
            const { data: businessHours } = await supabase
                .from('business_hours')
                .select('day_of_week, is_closed, open_time, close_time')
                .eq('business_id', businessId)
                .order('day_of_week');

            const context = {
                business,
                services: services || [],
                staff: staff || [],
                businessHours: businessHours || []
            };

            // Cache the result
            this.cache.set(cacheKey, {
                data: context,
                timestamp: Date.now()
            });

            return context;
        } catch (error) {
            console.error(`❌ Error fetching business context:`, error);
            return null;
        }
    }

    /**
     * Format services list for assistant context
     */
    formatServicesList(services) {
        if (!services || services.length === 0) {
            return "No services currently available.";
        }

        return services.map(service => {
            const price = `$${service.base_price}`;
            const duration = `${service.duration_minutes}min`;
            const deposit = service.requires_deposit ? ` (Deposit: $${service.deposit_amount})` : '';
            return `• ${service.name} - ${duration} - ${price}${deposit}`;
        }).join('\n');
    }

    /**
     * Format staff list for assistant context
     */
    formatStaffList(staff) {
        if (!staff || staff.length === 0) {
            return "Our skilled technicians are available to serve you.";
        }

        return staff.map(member => {
            const name = `${member.first_name} ${member.last_name}`;
            const specialties = member.specialties?.length > 0 
                ? ` (Specializes in: ${member.specialties.join(', ')})` 
                : '';
            return `• ${name}${specialties}`;
        }).join('\n');
    }

    /**
     * Format business hours for assistant context
     */
    formatBusinessHours(businessHours) {
        if (!businessHours || businessHours.length === 0) {
            return "Please call for our current hours.";
        }

        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        return businessHours.map(hours => {
            const day = days[hours.day_of_week];
            if (hours.is_closed) {
                return `${day}: Closed`;
            }
            return `${day}: ${hours.open_time} - ${hours.close_time}`;
        }).join('\n');
    }

    /**
     * Inject business context variables into text
     */
    async injectBusinessContext(text, businessId) {
        const context = await this.fetchBusinessContext(businessId);
        
        if (!context) {
            console.warn(`⚠️ Could not fetch context for business: ${businessId}`);
            return text;
        }

        const { business, services, staff, businessHours } = context;

        // Replace all context variables
        let injectedText = text
            // Basic business info
            .replace(/{BUSINESS_NAME}/g, business.name)
            .replace(/{BUSINESS_PHONE}/g, business.phone || '')
            .replace(/{BUSINESS_EMAIL}/g, business.email || '')
            .replace(/{BUSINESS_WEBSITE}/g, business.website || '')
            
            // Address
            .replace(/{BUSINESS_ADDRESS}/g, 
                `${business.address_line1}${business.city ? `, ${business.city}` : ''}${business.state ? `, ${business.state}` : ''}`)
            
            // Subscription and features
            .replace(/{SUBSCRIPTION_TIER}/g, business.subscription_tier)
            
            // Dynamic lists
            .replace(/{SERVICES_LIST}/g, this.formatServicesList(services))
            .replace(/{DETAILED_SERVICES_WITH_PRICING}/g, this.formatServicesList(services))
            .replace(/{STAFF_LIST}/g, this.formatStaffList(staff))
            .replace(/{STAFF_SPECIALTIES}/g, this.formatStaffList(staff))
            .replace(/{BUSINESS_HOURS}/g, this.formatBusinessHours(businessHours));

        console.log(`✅ Business context injected for: ${business.name}`);
        return injectedText;
    }

    /**
     * Inject context into Vapi function responses
     */
    async injectIntoFunctionResponse(response, businessId) {
        if (typeof response === 'string') {
            return await this.injectBusinessContext(response, businessId);
        }

        if (typeof response === 'object' && response !== null) {
            const injectedResponse = { ...response };
            
            // Inject into common response fields
            if (injectedResponse.message) {
                injectedResponse.message = await this.injectBusinessContext(injectedResponse.message, businessId);
            }
            
            if (injectedResponse.result) {
                injectedResponse.result = await this.injectBusinessContext(injectedResponse.result, businessId);
            }

            if (injectedResponse.speech) {
                injectedResponse.speech = await this.injectBusinessContext(injectedResponse.speech, businessId);
            }
            
            return injectedResponse;
        }

        return response;
    }

    /**
     * Clear cache for a specific business (call when business data is updated)
     */
    clearBusinessCache(businessId) {
        const cacheKey = `business_${businessId}`;
        this.cache.delete(cacheKey);
        console.log(`🗑️ Cleared cache for business: ${businessId}`);
    }

    /**
     * Clear all cached data
     */
    clearAllCache() {
        this.cache.clear();
        console.log('🗑️ Cleared all business context cache');
    }
}

module.exports = new BusinessContextInjector();