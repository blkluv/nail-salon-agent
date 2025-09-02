const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const CustomerAuthService = require('../services/CustomerAuthService');

// Rate limiting for auth endpoints
const authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: { error: 'Too many authentication attempts, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Authenticate with phone + last name
router.post('/login', authRateLimit, async (req, res) => {
    try {
        const { businessId, phoneNumber, lastName } = req.body;

        if (!businessId || !phoneNumber || !lastName) {
            return res.status(400).json({
                error: 'Business ID, phone number, and last name are required'
            });
        }

        // Normalize phone number
        const normalizedPhone = phoneNumber.replace(/\D/g, '');
        if (normalizedPhone.length < 10) {
            return res.status(400).json({ error: 'Invalid phone number format' });
        }

        const deviceInfo = {
            userAgent: req.headers['user-agent'],
            acceptLanguage: req.headers['accept-language']
        };

        const result = await CustomerAuthService.authenticateWithPhoneAndName(
            businessId,
            normalizedPhone,
            lastName.trim(),
            deviceInfo,
            req.ip
        );

        res.json({
            success: true,
            message: 'Login successful',
            sessionToken: result.sessionToken,
            expiresAt: result.expiresAt,
            customer: result.customer
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(400).json({
            error: error.message || 'Authentication failed'
        });
    }
});

// Logout
router.post('/logout', async (req, res) => {
    try {
        const sessionToken = req.headers.authorization?.split(' ')[1];

        if (sessionToken) {
            const { supabase } = require('../lib/supabase');
            await supabase
                .from('customer_sessions')
                .update({ expires_at: new Date().toISOString() }) // Expire session immediately
                .eq('session_token', sessionToken);
        }

        res.json({ success: true, message: 'Logged out successfully' });

    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Logout failed' });
    }
});

// Health check for customer auth
router.get('/status', (req, res) => {
    res.json({
        status: 'healthy',
        authMethod: 'phone_and_name',
        features: ['customer_login', 'session_management']
    });
});

// Debug session endpoint  
router.post('/debug-session', async (req, res) => {
    try {
        const { sessionToken } = req.body;
        
        if (!sessionToken) {
            return res.status(400).json({ error: 'Session token required' });
        }
        
        const session = await CustomerAuthService.validateSession(sessionToken);
        
        res.json({
            success: true,
            session: {
                id: session.id,
                business_id: session.business_id,
                customer_id: session.customer_id,
                expires_at: session.expires_at,
                customer: session.customer,
                business: session.business,
                keys: Object.keys(session)
            }
        });
        
    } catch (error) {
        res.status(400).json({
            error: error.message,
            details: 'Session validation failed'
        });
    }
});

module.exports = router;