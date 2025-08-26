#!/usr/bin/env node

const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 8080;

console.log('🚀 Starting simplified webhook server...');
console.log('📍 PORT:', PORT);

// Initialize Supabase
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://irvyhhkoiyzartmmvbxw.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlydnloaGtvaXl6YXJ0bW12Ynh3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTExODI5MywiZXhwIjoyMDcwNjk0MjkzfQ.61Zfyc87GpmpIlWFL1fyX6wcfydqCu6DUFuHnpNSvhk';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Middleware
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    console.log('💚 Health check requested');
    res.status(200).json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        port: PORT
    });
});

// Root route
app.get('/', (req, res) => {
    console.log('🏠 Root route accessed');
    res.status(200).json({ 
        message: 'Vapi Nail Salon Agent - LIVE!',
        status: 'active',
        timestamp: new Date().toISOString()
    });
});

// Vapi webhook
app.post('/webhook/vapi', async (req, res) => {
    console.log('📞 Vapi webhook called');
    res.status(200).json({ 
        status: 'received',
        message: 'Webhook is live and responding!'
    });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('✅ SERVER STARTED SUCCESSFULLY');
    console.log(`🌐 Listening on: http://0.0.0.0:${PORT}`);
    console.log(`📞 Health: http://0.0.0.0:${PORT}/health`);
    console.log('🎉 Ready for requests!');
});

server.on('error', (error) => {
    console.error('❌ Server error:', error);
});

module.exports = app;