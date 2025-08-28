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

// Send verification code
router.post('/send-verification', authRateLimit, async (req, res) => {
    try {
        const { businessId, phoneNumber } = req.body;

        if (!businessId || !phoneNumber) {
            return res.status(400).json({
                error: 'Business ID and phone number are required'
            });
        }

        // Normalize phone number
        const normalizedPhone = phoneNumber.replace(/\D/g, '');
        if (normalizedPhone.length < 10) {
            return res.status(400).json({ error: 'Invalid phone number format' });
        }

        const result = await CustomerAuthService.sendVerificationCode(
            businessId,
            `+1${normalizedPhone}`,
            req.ip
        );

        res.json({
            success: true,
            message: 'Verification code sent successfully',
            expiresAt: result.expiresAt
        });

    } catch (error) {
        console.error('Send verification error:', error);
        res.status(400).json({
            error: error.message || 'Failed to send verification code'
        });
    }
});

// Verify code
router.post('/verify-code', authRateLimit, async (req, res) => {
    try {
        const { businessId, phoneNumber, code } = req.body;

        if (!businessId || !phoneNumber || !code) {
            return res.status(400).json({
                error: 'Business ID, phone number, and code are required'
            });
        }

        const normalizedPhone = phoneNumber.replace(/\D/g, '');
        const deviceInfo = {
            userAgent: req.headers['user-agent'],
            acceptLanguage: req.headers['accept-language']
        };

        const result = await CustomerAuthService.verifyCode(
            businessId,
            `+1${normalizedPhone}`,
            code,
            deviceInfo,
            req.ip
        );

        res.json(result);

    } catch (error) {
        console.error('Verify code error:', error);
        res.status(400).json({
            error: error.message || 'Verification failed'
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

// Resend code
router.post('/resend-code', authRateLimit, async (req, res) => {
    try {
        const { businessId, phoneNumber } = req.body;

        if (!businessId || !phoneNumber) {
            return res.status(400).json({
                error: 'Business ID and phone number are required'
            });
        }

        const normalizedPhone = phoneNumber.replace(/\D/g, '');

        const result = await CustomerAuthService.sendVerificationCode(
            businessId,
            `+1${normalizedPhone}`,
            req.ip
        );

        res.json({
            success: true,
            message: 'Verification code resent successfully',
            expiresAt: result.expiresAt
        });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;