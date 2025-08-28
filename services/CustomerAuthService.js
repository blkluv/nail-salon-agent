const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { supabase } = require('../lib/supabase');
const SMSService = require('./SMSService');

class CustomerAuthService {
    constructor() {
        this.JWT_SECRET = process.env.CUSTOMER_JWT_SECRET || 'your-secret-key';
        this.CODE_EXPIRY = 10 * 60 * 1000; // 10 minutes
        this.SESSION_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days
        this.MAX_ATTEMPTS = 3;
        this.RATE_LIMIT = 3; // codes per hour
    }

    // Generate and send verification code
    async sendVerificationCode(businessId, phoneNumber, ipAddress = null) {
        try {
            // Check rate limit
            await this.checkRateLimit(businessId, phoneNumber);

            // Generate 6-digit code
            const code = this.generateCode();
            const expiresAt = new Date(Date.now() + this.CODE_EXPIRY);

            // Store in database
            const { error: insertError } = await supabase
                .from('customer_verification_codes')
                .insert({
                    business_id: businessId,
                    customer_phone: phoneNumber,
                    verification_code: code,
                    expires_at: expiresAt.toISOString()
                });

            if (insertError) throw insertError;

            // Send SMS
            await SMSService.sendVerificationCode(businessId, phoneNumber, code);

            return { success: true, expiresAt };

        } catch (error) {
            console.error('Send verification error:', error);
            throw new Error(error.message || 'Failed to send verification code');
        }
    }

    // Verify code and create session
    async verifyCode(businessId, phoneNumber, code, deviceInfo = {}, ipAddress = null) {
        try {
            // Find valid code
            const { data: codeRecord, error: findError } = await supabase
                .from('customer_verification_codes')
                .select('*')
                .eq('business_id', businessId)
                .eq('customer_phone', phoneNumber)
                .eq('verification_code', code)
                .eq('is_used', false)
                .gt('expires_at', new Date().toISOString())
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (findError || !codeRecord) {
                // Increment attempts
                await this.incrementAttempts(businessId, phoneNumber);
                throw new Error('Invalid or expired verification code');
            }

            // Mark code as used
            await supabase
                .from('customer_verification_codes')
                .update({ is_used: true })
                .eq('id', codeRecord.id);

            // Find or create customer
            let customer = await this.findCustomerByPhone(businessId, phoneNumber);
            if (!customer) {
                customer = await this.createCustomerFromPhone(businessId, phoneNumber);
            }

            // Update customer verification status
            await supabase
                .from('customers')
                .update({
                    phone_verified: true,
                    portal_last_login: new Date().toISOString(),
                    portal_login_count: (customer.portal_login_count || 0) + 1
                })
                .eq('id', customer.id);

            // Create session
            const sessionToken = this.generateSessionToken(customer.id, businessId);
            const sessionExpiresAt = new Date(Date.now() + this.SESSION_EXPIRY);

            await supabase
                .from('customer_sessions')
                .insert({
                    business_id: businessId,
                    customer_id: customer.id,
                    session_token: sessionToken,
                    expires_at: sessionExpiresAt.toISOString(),
                    device_info: deviceInfo,
                    ip_address: ipAddress
                });

            // Log activity
            await this.logPortalActivity(businessId, customer.id, 'login', {}, ipAddress);

            return {
                success: true,
                sessionToken,
                expiresAt: sessionExpiresAt,
                customer: {
                    id: customer.id,
                    first_name: customer.first_name,
                    last_name: customer.last_name,
                    phone: customer.phone,
                    email: customer.email
                }
            };

        } catch (error) {
            console.error('Verify code error:', error);
            throw new Error(error.message || 'Verification failed');
        }
    }

    // Validate session token
    async validateSession(sessionToken) {
        try {
            const { data: session, error } = await supabase
                .from('customer_sessions')
                .select(`
                    *,
                    customer:customers(*),
                    business:businesses(*)
                `)
                .eq('session_token', sessionToken)
                .gt('expires_at', new Date().toISOString())
                .single();

            if (error || !session) {
                throw new Error('Invalid or expired session');
            }

            // Update last accessed
            await supabase
                .from('customer_sessions')
                .update({ last_accessed_at: new Date().toISOString() })
                .eq('id', session.id);

            return session;

        } catch (error) {
            throw new Error('Session validation failed');
        }
    }

    // Helper methods
    generateCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    generateSessionToken(customerId, businessId) {
        return jwt.sign(
            { customerId, businessId, type: 'customer_session' },
            this.JWT_SECRET,
            { expiresIn: '7d' }
        );
    }

    async checkRateLimit(businessId, phoneNumber) {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

        const { count } = await supabase
            .from('customer_verification_codes')
            .select('*', { count: 'exact', head: true })
            .eq('business_id', businessId)
            .eq('customer_phone', phoneNumber)
            .gt('created_at', oneHourAgo.toISOString());

        if (count >= this.RATE_LIMIT) {
            throw new Error('Too many verification attempts. Please wait before trying again.');
        }
    }

    async incrementAttempts(businessId, phoneNumber) {
        await supabase
            .from('customer_verification_codes')
            .update({ attempts: supabase.raw('attempts + 1') })
            .eq('business_id', businessId)
            .eq('customer_phone', phoneNumber)
            .eq('is_used', false);
    }

    async findCustomerByPhone(businessId, phoneNumber) {
        const { data } = await supabase
            .from('customers')
            .select('*')
            .eq('business_id', businessId)
            .eq('phone', phoneNumber)
            .single();

        return data;
    }

    async createCustomerFromPhone(businessId, phoneNumber) {
        const { data, error } = await supabase
            .from('customers')
            .insert({
                business_id: businessId,
                phone: phoneNumber,
                first_name: 'Customer',
                last_name: phoneNumber.slice(-4),
                total_visits: 0,
                total_spent: 0,
                phone_verified: true,
                portal_login_count: 0
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async logPortalActivity(businessId, customerId, activityType, activityData = {}, ipAddress = null) {
        await supabase
            .from('customer_portal_activities')
            .insert({
                business_id: businessId,
                customer_id: customerId,
                activity_type: activityType,
                activity_data: activityData,
                ip_address: ipAddress
            });
    }
}

module.exports = new CustomerAuthService();