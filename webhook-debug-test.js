#!/usr/bin/env node

/**
 * Simple webhook test to debug what Vapi is sending
 * Run this locally and update Vapi webhook URL temporarily for debugging
 */

const express = require('express');
const app = express();
const PORT = 3003;

app.use(express.json());

// Debug webhook - logs everything Vapi sends
app.post('/webhook/vapi', (req, res) => {
    const timestamp = new Date().toISOString();
    
    console.log(`\n=== VAPI WEBHOOK DEBUG [${timestamp}] ===`);
    console.log('Full payload:');
    console.log(JSON.stringify(req.body, null, 2));
    
    console.log('\n📞 Phone number extraction attempts:');
    console.log('- req.body.call?.assistantPhoneNumber:', req.body.call?.assistantPhoneNumber);
    console.log('- req.body.call?.phoneNumber:', req.body.call?.phoneNumber);
    console.log('- req.body.call?.customer?.number:', req.body.call?.customer?.number);
    console.log('- req.body.phoneNumber:', req.body.phoneNumber);
    console.log('- req.body.assistantPhoneNumber:', req.body.assistantPhoneNumber);
    
    console.log('\n📋 Message info:');
    console.log('- Message type:', req.body.message?.type);
    console.log('- Has toolCalls:', !!req.body.message?.toolCalls);
    console.log('- Has functionCall:', !!req.body.message?.functionCall);
    
    if (req.body.message?.toolCalls) {
        console.log('\n🔧 Function calls:');
        req.body.message.toolCalls.forEach((call, i) => {
            console.log(`  ${i + 1}. ${call.function?.name}:`, call.function?.arguments);
        });
    }
    
    console.log('=====================================\n');
    
    // Simple response
    res.json({ 
        status: 'debug received',
        timestamp,
        phoneDetected: !!(req.body.call?.assistantPhoneNumber || req.body.call?.phoneNumber)
    });
});

app.listen(PORT, () => {
    console.log(`🔍 Webhook debug server running on port ${PORT}`);
    console.log(`📞 Temporarily update Vapi webhook to: http://localhost:${PORT}/webhook/vapi`);
    console.log('🧪 Make a test call to see what data Vapi actually sends');
    console.log('\nPress Ctrl+C when done debugging...');
});