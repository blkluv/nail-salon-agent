const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');
const CustomerAuthService = require('../services/CustomerAuthService');

// Customer authentication middleware
const customerAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'No session token provided' });
        }

        const session = await CustomerAuthService.validateSession(token);
        
        // Handle different possible session structures
        if (session.customer) {
            // If customer data is joined
            req.customer = session.customer;
        } else {
            // If we only have customer_id, fetch the customer
            const { data: customer } = await supabase
                .from('customers')
                .select('*')
                .eq('id', session.customer_id)
                .single();
            req.customer = customer;
        }
        
        req.businessId = session.business_id;
        req.sessionId = session.id;

        console.log('🔐 Customer auth success:', {
            customerId: req.customer?.id,
            customerName: req.customer ? `${req.customer.first_name} ${req.customer.last_name}` : 'unknown',
            businessId: req.businessId,
            sessionId: req.sessionId
        });

        next();
    } catch (error) {
        console.error('❌ Customer auth failed:', error);
        res.status(401).json({ error: 'Invalid session' });
    }
};

// Get customer profile
router.get('/profile', customerAuth, async (req, res) => {
    try {
        const { data: customer, error } = await supabase
            .from('customers')
            .select(`
                id, first_name, last_name, phone, email,
                preferences, total_visits, total_spent,
                loyalty_points, loyalty_tier, created_at
            `)
            .eq('id', req.customer.id)
            .single();

        if (error) throw error;

        // Log activity
        await CustomerAuthService.logPortalActivity(
            req.businessId,
            req.customer.id,
            'view_profile',
            {},
            req.ip
        );

        res.json({ success: true, customer });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to load profile' });
    }
});

// Update customer profile
router.put('/profile', customerAuth, async (req, res) => {
    try {
        const { first_name, last_name, email } = req.body;
        const updates = {};

        if (first_name) updates.first_name = first_name;
        if (last_name) updates.last_name = last_name;
        if (email) updates.email = email;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }

        const { data: customer, error } = await supabase
            .from('customers')
            .update(updates)
            .eq('id', req.customer.id)
            .select()
            .single();

        if (error) throw error;

        // Log activity
        await CustomerAuthService.logPortalActivity(
            req.businessId,
            req.customer.id,
            'update_profile',
            { updated_fields: Object.keys(updates) },
            req.ip
        );

        res.json({ success: true, customer });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Get customer appointments
router.get('/appointments', customerAuth, async (req, res) => {
    try {
        const { status, limit = 20, offset = 0 } = req.query;

        console.log('🔍 Fetching appointments for customer:', {
            customerId: req.customer.id,
            businessId: req.businessId,
            status: status,
            limit: limit
        });

        // First try a simple query without joins to ensure basic functionality
        let query = supabase
            .from('appointments')
            .select('*')
            .eq('customer_id', req.customer.id)
            .order('appointment_date', { ascending: false })
            .order('start_time', { ascending: false })
            .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

        if (status) {
            query = query.eq('status', status);
        }

        const { data: appointments, error } = await query;

        if (error) {
            console.error('❌ Appointments query error:', error);
            throw error;
        }

        console.log('✅ Found appointments:', appointments?.length || 0);

        // Log activity
        await CustomerAuthService.logPortalActivity(
            req.businessId,
            req.customer.id,
            'view_appointments',
            { status_filter: status, count: appointments?.length || 0 },
            req.ip
        );

        res.json({ success: true, appointments: appointments || [] });

    } catch (error) {
        console.error('Get appointments error:', error);
        res.status(500).json({ error: 'Failed to load appointments' });
    }
});

// Reschedule appointment
router.post('/appointments/:appointmentId/reschedule', customerAuth, async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { appointment_date, start_time } = req.body;

        if (!appointment_date || !start_time) {
            return res.status(400).json({
                error: 'Appointment date and start time are required'
            });
        }

        // Verify appointment belongs to customer
        const { data: appointment, error: fetchError } = await supabase
            .from('appointments')
            .select('*')
            .eq('id', appointmentId)
            .eq('customer_id', req.customer.id)
            .single();

        if (fetchError || !appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        if (appointment.status === 'completed' || appointment.status === 'cancelled') {
            return res.status(400).json({
                error: 'Cannot reschedule completed or cancelled appointments'
            });
        }

        // Check if new time is in the future
        const appointmentDateTime = new Date(`${appointment_date} ${start_time}`);
        const now = new Date();

        if (appointmentDateTime <= now) {
            return res.status(400).json({
                error: 'Cannot reschedule to a past date/time'
            });
        }

        // Calculate end time based on service duration
        const { data: service } = await supabase
            .from('services')
            .select('duration_minutes')
            .eq('id', appointment.service_id)
            .single();

        let end_time = start_time;
        if (service?.duration_minutes) {
            const startDate = new Date(`${appointment_date} ${start_time}`);
            const endDate = new Date(startDate.getTime() + (service.duration_minutes * 60 * 1000));
            end_time = endDate.toTimeString().slice(0, 5); // HH:MM format
        }

        // Update appointment
        const { data: updatedAppointment, error: updateError } = await supabase
            .from('appointments')
            .update({
                appointment_date,
                start_time,
                end_time,
                status: 'confirmed',
                updated_at: new Date().toISOString()
            })
            .eq('id', appointmentId)
            .select(`
                id, appointment_date, start_time, end_time, status,
                service:services(name),
                staff:staff(first_name, last_name)
            `)
            .single();

        if (updateError) throw updateError;

        // Log activity
        await CustomerAuthService.logPortalActivity(
            req.businessId,
            req.customer.id,
            'reschedule_appointment',
            {
                appointment_id: appointmentId,
                old_date: appointment.appointment_date,
                old_time: appointment.start_time,
                new_date: appointment_date,
                new_time: start_time
            },
            req.ip
        );

        // Log analytics event
        await supabase
            .from('analytics_events')
            .insert({
                business_id: req.businessId,
                event_type: 'appointment_rescheduled',
                event_data: {
                    appointment_id: appointmentId,
                    customer_id: req.customer.id,
                    rescheduled_via: 'customer_portal'
                },
                customer_id: req.customer.id,
                appointment_id: appointmentId
            });

        res.json({
            success: true,
            message: 'Appointment rescheduled successfully',
            appointment: updatedAppointment
        });

    } catch (error) {
        console.error('Reschedule appointment error:', error);
        res.status(500).json({ error: 'Failed to reschedule appointment' });
    }
});

// Cancel appointment
router.delete('/appointments/:appointmentId', customerAuth, async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { reason } = req.body;

        // Verify appointment belongs to customer
        const { data: appointment, error: fetchError } = await supabase
            .from('appointments')
            .select('*')
            .eq('id', appointmentId)
            .eq('customer_id', req.customer.id)
            .single();

        if (fetchError || !appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        if (appointment.status === 'completed' || appointment.status === 'cancelled') {
            return res.status(400).json({
                error: 'Cannot cancel completed or cancelled appointments'
            });
        }

        // Check cancellation policy (24-hour notice, etc.)
        const appointmentDateTime = new Date(`${appointment.appointment_date} ${appointment.start_time}`);
        const now = new Date();
        const hoursUntilAppointment = (appointmentDateTime - now) / (1000 * 60 * 60);

        // Cancel appointment
        const { data: cancelledAppointment, error: updateError } = await supabase
            .from('appointments')
            .update({
                status: 'cancelled',
                internal_notes: `Cancelled by customer via portal. Reason: ${reason || 'No reason provided'}`,
                updated_at: new Date().toISOString()
            })
            .eq('id', appointmentId)
            .select(`
                id, appointment_date, start_time, status,
                service:services(name),
                staff:staff(first_name, last_name)
            `)
            .single();

        if (updateError) throw updateError;

        // Log activity
        await CustomerAuthService.logPortalActivity(
            req.businessId,
            req.customer.id,
            'cancel_appointment',
            {
                appointment_id: appointmentId,
                reason: reason || 'No reason provided',
                hours_notice: hoursUntilAppointment
            },
            req.ip
        );

        // Log analytics event
        await supabase
            .from('analytics_events')
            .insert({
                business_id: req.businessId,
                event_type: 'appointment_cancelled',
                event_data: {
                    appointment_id: appointmentId,
                    customer_id: req.customer.id,
                    cancelled_via: 'customer_portal',
                    reason: reason,
                    hours_notice: hoursUntilAppointment
                },
                customer_id: req.customer.id,
                appointment_id: appointmentId
            });

        res.json({
            success: true,
            message: 'Appointment cancelled successfully',
            appointment: cancelledAppointment
        });

    } catch (error) {
        console.error('Cancel appointment error:', error);
        res.status(500).json({ error: 'Failed to cancel appointment' });
    }
});

// Update preferences
router.put('/preferences', customerAuth, async (req, res) => {
    try {
        const { notifications, email_marketing, sms_reminders } = req.body;

        const preferences = {
            notifications: Boolean(notifications),
            email_marketing: Boolean(email_marketing),
            sms_reminders: Boolean(sms_reminders)
        };

        const { data: customer, error } = await supabase
            .from('customers')
            .update({ preferences })
            .eq('id', req.customer.id)
            .select('preferences')
            .single();

        if (error) throw error;

        // Log activity
        await CustomerAuthService.logPortalActivity(
            req.businessId,
            req.customer.id,
            'update_preferences',
            { new_preferences: preferences },
            req.ip
        );

        res.json({
            success: true,
            message: 'Preferences updated successfully',
            preferences: customer.preferences
        });

    } catch (error) {
        console.error('Update preferences error:', error);
        res.status(500).json({ error: 'Failed to update preferences' });
    }
});

module.exports = router;