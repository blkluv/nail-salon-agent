/**
 * Vapi Assistant Dynamic Configuration Updater
 * Updates assistant prompts with real business data
 */

const businessContextInjector = require('./business-context-injector');

class VapiAssistantUpdater {
    constructor() {
        this.vapiApiKey = process.env.VAPI_API_KEY || '1d33c846-52ba-46ff-b663-16fb6c67af9e';
        this.assistantId = '8ab7e000-aea8-4141-a471-33133219a471';
        this.baseUrl = 'https://api.vapi.ai';
    }

    /**
     * Update assistant configuration with business-specific data
     */
    async updateAssistantForBusiness(businessId) {
        try {
            console.log(`🔄 Updating Vapi assistant for business: ${businessId}`);

            // Get business context
            const context = await businessContextInjector.fetchBusinessContext(businessId);
            if (!context) {
                throw new Error('Could not fetch business context');
            }

            const { business, services, staff, businessHours } = context;

            // Create dynamic first message
            const firstMessage = `Hi! Thanks for calling ${business.name}! I'm your AI booking assistant. How can I help you today - would you like to book an appointment, check our services, or ask about availability?`;

            // Create dynamic system message
            const systemMessage = `You are a professional booking assistant for ${business.name}, a nail salon.

IMPORTANT CONTEXT:
- Business Name: ${business.name}
- Phone: ${business.phone || 'Please call for information'}
- Address: ${business.address_line1}${business.city ? `, ${business.city}` : ''}${business.state ? `, ${business.state}` : ''}
- Subscription Tier: ${business.subscription_tier}
- Available Services: 
${businessContextInjector.formatServicesList(services)}

- Staff Members:
${businessContextInjector.formatStaffList(staff)}

- Business Hours:
${businessContextInjector.formatBusinessHours(businessHours)}

YOUR ROLE:
- Help customers book appointments at ${business.name}
- Answer questions about services and pricing  
- Check availability with staff members
- Provide business information (hours, location, services)
- Be warm, professional, and helpful

BOOKING PROCESS:
1. Greet customer and identify their needs
2. Suggest appropriate services from our menu
3. Check staff availability for preferred dates/times
4. Collect customer information (name, phone, email)  
5. Confirm appointment details
6. Provide confirmation and next steps

BUSINESS POLICIES:
- Cancellation policy: 24 hours notice required
- Deposit required for services over $75
- We accept cash, card, and digital payments
- Please arrive 10 minutes early

CONVERSATION STYLE:
- Natural and conversational
- Ask clarifying questions
- Suggest upgrades when appropriate  
- Handle objections professionally
- Always end with clear next steps

If you cannot handle a request, politely offer to transfer to a human staff member or take a message for callback.`;

            // Update assistant via Vapi API
            const response = await fetch(`${this.baseUrl}/assistant/${this.assistantId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${this.vapiApiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    firstMessage: firstMessage,
                    model: {
                        provider: 'openai',
                        model: 'gpt-4o',
                        messages: [{
                            role: 'system',
                            content: systemMessage
                        }],
                        temperature: 0.7,
                        maxTokens: 1000
                    }
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Vapi API error: ${response.status} - ${errorText}`);
            }

            const result = await response.json();
            console.log(`✅ Assistant updated successfully for ${business.name}`);
            
            return result;

        } catch (error) {
            console.error('❌ Error updating Vapi assistant:', error);
            throw error;
        }
    }

    /**
     * Update assistant for the latest business (for testing)
     */
    async updateForLatestBusiness() {
        try {
            const { createClient } = require('@supabase/supabase-js');
            const supabase = createClient(
                process.env.SUPABASE_URL || 'https://irvyhhkoiyzartmmvbxw.supabase.co',
                process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlydnloaGtvaXl6YXJ0bW12Ynh3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTExODI5MywiZXhwIjoyMDcwNjk0MjkzfQ.61Zfyc87GpmpIlWFL1fyX6wcfydqCu6DUFuHnpNSvhk'
            );

            const { data: business } = await supabase
                .from('businesses')
                .select('id, name')
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (!business) {
                throw new Error('No businesses found');
            }

            console.log(`🎯 Updating assistant for latest business: ${business.name}`);
            return await this.updateAssistantForBusiness(business.id);

        } catch (error) {
            console.error('❌ Error updating for latest business:', error);
            throw error;
        }
    }
}

module.exports = new VapiAssistantUpdater();