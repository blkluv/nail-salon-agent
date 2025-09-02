#!/usr/bin/env node

/**
 * Debug Vapi Webhook Payload
 * Logs the full payload to understand what data is available
 */

const express = require('express');
const app = express();
const PORT = 3002;

app.use(express.json());

// Debug webhook to see full Vapi payload
app.post('/webhook/vapi', (req, res) => {
    console.log('\n=== FULL VAPI WEBHOOK PAYLOAD ===');
    console.log(JSON.stringify(req.body, null, 2));
    console.log('==================================\n');
    
    // Extract all possible phone-related fields
    const payload = req.body;
    console.log('📞 Phone Number Analysis:');
    console.log('- payload.call?.assistantPhoneNumber:', payload.call?.assistantPhoneNumber);
    console.log('- payload.call?.phoneNumber:', payload.call?.phoneNumber);
    console.log('- payload.call?.customer?.number:', payload.call?.customer?.number);
    console.log('- payload.phoneNumber:', payload.phoneNumber);
    console.log('- payload.assistantPhoneNumber:', payload.assistantPhoneNumber);
    
    res.json({ status: 'debug logged' });
});

app.listen(PORT, () => {
    console.log(`🔍 Debug webhook running on port ${PORT}`);
    console.log(`🧪 Temporarily update Vapi webhook to: http://localhost:${PORT}/webhook/vapi`);
    console.log('📞 Make a test call to see full payload structure');
});