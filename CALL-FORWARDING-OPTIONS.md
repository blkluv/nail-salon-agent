# Call Forwarding Options for Existing Salon Numbers

## 🎯 **The Problem**
Salons don't want to change their existing phone numbers, but they want AI booking benefits.

## 📞 **Solution: Smart Call Routing**

### **Option 1: AI-First with Fallback Forwarding** ⭐ RECOMMENDED

```
Customer calls existing salon number → Vapi AI answers
├── Can book appointment? → AI handles it ✅
├── Complex request? → Forward to salon staff 📞
├── After hours? → AI books, then sends confirmation
└── Emergency? → Immediate forward
```

**Benefits:**
- ✅ Keep existing number
- ✅ AI handles 80% of calls (bookings)
- ✅ Staff gets complex calls only
- ✅ 24/7 booking availability

### **Option 2: Time-Based Routing**

```
Business Hours: AI → Forward if needed
After Hours: AI only (books appointments)
Weekends: AI only
Holidays: AI only
```

### **Option 3: Call Type Detection**

```
"Book appointment" → AI handles
"Cancel appointment" → AI handles  
"Ask about services" → AI handles
"Speak to manager" → Forward immediately
"Complaint" → Forward immediately
```

## 🔧 **Implementation with Vapi**

### **Method 1: Vapi Native Call Transfer**

Vapi has a built-in `transferCall` function:

```javascript
// In your assistant's system prompt:
"If the customer needs to speak with a human or has a complex request 
that you cannot handle, use the transferCall function to connect them 
to the salon staff at their main number."

// Function definition:
{
  "type": "function",
  "function": {
    "name": "transferCall",
    "description": "Transfer call to salon staff for complex requests",
    "parameters": {
      "type": "object", 
      "properties": {
        "reason": {
          "type": "string",
          "description": "Reason for transfer"
        }
      }
    }
  }
}
```

### **Method 2: Webhook-Controlled Forwarding**

```javascript
// In your webhook-server.js
async function shouldForwardCall(message, businessId) {
    const business = await supabase
        .from('businesses')
        .select('forwarding_number, forwarding_rules')
        .eq('id', businessId)
        .single();
    
    // Check business rules
    const now = new Date();
    const businessHours = await getBusinessHours(businessId, now);
    
    if (!businessHours.isOpen) {
        return { forward: false, reason: 'after_hours' };
    }
    
    // AI couldn't handle the request
    if (message.type === 'transfer_request') {
        return { 
            forward: true, 
            number: business.data.forwarding_number,
            reason: 'ai_transfer'
        };
    }
    
    return { forward: false };
}
```

## 🚀 **Smart Implementation Plan**

### **Database Updates:**

```sql
-- Add forwarding fields to businesses table
ALTER TABLE businesses ADD COLUMN forwarding_enabled BOOLEAN DEFAULT false;
ALTER TABLE businesses ADD COLUMN forwarding_number VARCHAR(20);
ALTER TABLE businesses ADD COLUMN forwarding_rules JSONB DEFAULT '{}';

-- Example forwarding rules:
{
  "forward_after_hours": true,
  "forward_complex_requests": true,
  "forward_keywords": ["manager", "complaint", "problem"],
  "ai_handles": ["book", "cancel", "reschedule", "available"]
}
```

### **Enhanced Onboarding Step:**

Let me create an additional step in the onboarding for call forwarding preferences:

```javascript
// Step 5: Call Forwarding Setup (NEW)
const [forwardingPrefs, setForwardingPrefs] = useState({
  enabled: false,
  existingNumber: '',
  strategy: 'ai_first', // 'ai_first', 'time_based', 'forward_all'
  forwardAfterHours: true,
  forwardComplexCalls: true
});
```

## 💰 **Cost & Benefits Analysis**

### **Option 1: Keep Existing + Add Vapi (Recommended)**

**Setup:**
1. Salon keeps: (555) 123-4567 (existing)
2. We configure Vapi to answer that number
3. AI handles bookings, forwards when needed

**Customer Experience:**
- Calls same number they always have ✅
- Gets instant AI booking 80% of time ✅
- Complex requests go to humans ✅

**Cost:**
- $2/month for Vapi number configuration
- No number change needed ✅

### **Option 2: Two Numbers (Current Implementation)**

**Setup:**
1. Salon keeps: (555) 123-4567 (existing)
2. We assign: (555) 987-6543 (new Vapi)
3. Marketing: "Call NEW number for bookings"

**Issues:**
- Customer confusion ❌
- Marketing burden ❌
- Two numbers to manage ❌

### **Option 3: Replace Existing Number**

**Setup:**
1. Port existing number to Vapi
2. Configure AI on that number

**Issues:**
- Complex porting process ❌
- Risk of losing number ❌
- Technical complications ❌

## 🎯 **Recommended Implementation**

### **Phase 1: Add Forwarding Option to Onboarding**

```javascript
// New onboarding step: "Phone Integration"
<div className="space-y-4">
  <h3>How would you like to handle phone calls?</h3>
  
  <div className="space-y-3">
    <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer">
      <input 
        type="radio" 
        value="new_number"
        checked={phoneStrategy === 'new_number'}
        onChange={(e) => setPhoneStrategy(e.target.value)}
      />
      <div>
        <div className="font-medium">Get New AI Phone Number</div>
        <div className="text-sm text-gray-600">
          We'll assign a new number for AI bookings
        </div>
      </div>
    </label>
    
    <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer">
      <input 
        type="radio" 
        value="forward_existing"
        checked={phoneStrategy === 'forward_existing'}
        onChange={(e) => setPhoneStrategy(e.target.value)}
      />
      <div>
        <div className="font-medium">Use Existing Number with AI</div>
        <div className="text-sm text-gray-600">
          Keep your current number, AI handles bookings + forwards complex calls
        </div>
      </div>
    </label>
  </div>
  
  {phoneStrategy === 'forward_existing' && (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <label className="block text-sm font-medium mb-2">
        Your Current Phone Number
      </label>
      <input
        type="tel"
        value={existingNumber}
        onChange={(e) => setExistingNumber(e.target.value)}
        className="w-full px-3 py-2 border rounded-lg"
        placeholder="(555) 123-4567"
      />
    </div>
  )}
</div>
```

### **Phase 2: Configure Vapi for Number Takeover**

Instead of buying a new number, configure Vapi to handle the existing number:

```javascript
// Updated VapiPhoneService
static async configureExistingNumber(phoneNumber, businessId, businessName) {
    try {
        // This requires working with Vapi to port/configure existing numbers
        // May need custom arrangement with Vapi team
        
        const response = await fetch('https://api.vapi.ai/phone-number/configure-existing', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${VAPI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                phoneNumber: phoneNumber,
                assistantId: SHARED_ASSISTANT_ID,
                serverUrl: WEBHOOK_URL,
                forwardingNumber: phoneNumber, // Same number for fallback
                forwardingRules: {
                    transferOnKeywords: ['human', 'manager', 'speak to someone'],
                    transferAfterHours: false, // AI handles after hours
                    maxAIAttempts: 3 // Try AI first, then transfer
                }
            })
        });
        
        return await response.json();
    } catch (error) {
        console.error('Existing number configuration failed:', error);
        throw error;
    }
}
```

Want me to implement the enhanced onboarding step with call forwarding options? This would let salons choose their preferred approach during setup!