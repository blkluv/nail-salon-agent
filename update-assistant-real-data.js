const businessContextInjector = require('./business-context-injector');

async function updateAssistantWithRealData() {
    try {
        console.log('🔄 Updating assistant with real business data...');
        
        // Get Bella's business ID
        const businessId = 'bb18c6ca-7e97-449d-8245-e3c28a6b6971';
        
        // Fetch business context
        const context = await businessContextInjector.fetchBusinessContext(businessId);
        if (!context) {
            throw new Error('Could not fetch business context');
        }

        const { business, services, staff, businessHours } = context;

        // Create optimized prompts with REAL data
        const firstMessage = `Hi! Thanks for calling ${business.name}! I'm your AI booking assistant. How can I help you today?`;

        const systemMessage = `You are a professional but CONCISE booking assistant for ${business.name}.

IMPORTANT: Keep responses SHORT and DIRECT. Customers want quick bookings, not long explanations.

BUSINESS CONTEXT:
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

STREAMLINED CONVERSATION FLOW:

1. GREETING: Already handled in firstMessage

2. SERVICE REQUEST: 
   - Customer: "I want to book an appointment"
   - You: "What service would you like?"

3. SERVICE SELECTION:
   - Customer: "Manicure" 
   - You: "Classic manicure ($25) or gel manicure ($45) - which would you prefer?"
   - Use the actual services and prices from above

4. DATE/TIME:
   - You: "What day and time work for you?"
   - Customer gives time
   - You: "Let me check... Yes, [day] at [time] is available!"

5. CUSTOMER INFO:
   - You: "I'll need your name, phone number, and email to book this."

6. CONFIRMATION:
   - You: "Great! [Service], [day] [time], $[price]. Please arrive 10 minutes early."

DO NOT:
- List all services unless specifically asked
- Read back full business hours unless asked
- Give long explanations about services
- Repeat all customer details back
- Suggest upsells unless customer asks
- Say "please hold on for a moment" when checking availability

DO:
- Be friendly but brief
- Get to the point quickly
- Confirm key details only
- Use natural, conversational language
- Handle one request at a time efficiently

RESPONSE LENGTH: Aim for 1-2 sentences maximum per response.

Example of GOOD response:
Customer: "I want a manicure"
You: "Classic manicure ($25) or gel manicure ($45)?"

If you cannot handle a request, politely offer to transfer to a human staff member.`;

        // Update assistant via Vapi API
        const response = await fetch('https://api.vapi.ai/assistant/8ab7e000-aea8-4141-a471-33133219a471', {
            method: 'PATCH',
            headers: {
                'Authorization': 'Bearer 1d33c846-52ba-46ff-b663-16fb6c67af9e',
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
                    temperature: 0.3,
                    maxTokens: 150
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Vapi API error: ${response.status} - ${errorText}`);
        }

        console.log(`✅ Assistant updated with real data for ${business.name}!`);
        console.log('📞 Now call (424) 351-9304 - should say "Thanks for calling Bella\'s Nails Studio!"');
        
    } catch (error) {
        console.error('❌ Update failed:', error.message);
    }
}

updateAssistantWithRealData();