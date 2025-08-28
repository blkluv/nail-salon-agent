const express = require('express');
const router = express.Router();
const AnalyticsService = require('../services/AnalyticsService');

// Simple business authentication middleware (you can enhance this)
const businessAuth = async (req, res, next) => {
    try {
        // For now, just check if business ID is provided
        // In production, you'd want proper business authentication
        const businessId = req.params.businessId || req.body.businessId || req.query.businessId;

        if (!businessId) {
            return res.status(400).json({ error: 'Business ID is required' });
        }

        req.businessId = businessId;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Business authentication failed' });
    }
};

// Feature flag check middleware
const checkFeatureAccess = (requiredFeature) => {
    return async (req, res, next) => {
        try {
            const { supabase } = require('../lib/supabase');
            const { data: business } = await supabase
                .from('businesses')
                .select('subscription_tier')
                .eq('id', req.businessId)
                .single();

            if (!business) {
                return res.status(404).json({ error: 'Business not found' });
            }

            // Simple feature check based on tier
            const tierFeatures = {
                starter: ['smart_analytics'],
                professional: ['smart_analytics', 'advanced_reporting'],
                business: ['smart_analytics', 'advanced_reporting', 'multi_location'],
                enterprise: ['smart_analytics', 'advanced_reporting', 'multi_location', 'white_label']
            };

            const allowedFeatures = tierFeatures[business.subscription_tier] || [];

            if (!allowedFeatures.includes(requiredFeature)) {
                return res.status(403).json({
                    error: `Feature '${requiredFeature}' requires ${requiredFeature === 'advanced_reporting' ? 'Professional' : 'Business'} plan or higher`,
                    current_tier: business.subscription_tier,
                    upgrade_required: true
                });
            }

            req.businessTier = business.subscription_tier;
            next();
        } catch (error) {
            console.error('Feature check error:', error);
            res.status(500).json({ error: 'Feature access check failed' });
        }
    };
};

// Get dashboard analytics
router.get('/dashboard/:businessId', businessAuth, checkFeatureAccess('smart_analytics'), async (req, res) => {
    try {
        const { dateRange = 'month' } = req.query;

        if (!['week', 'month', 'quarter', 'year'].includes(dateRange)) {
            return res.status(400).json({ error: 'Invalid date range. Use: week, month, quarter, or year' });
        }

        const analytics = new AnalyticsService();
        const analyticsData = await Promise.all([
            analytics.getRealTimeMetrics(req.businessId),
            analytics.getCustomerInsights(req.businessId),
            analytics.getServicePerformance(req.businessId),
            analytics.getStaffPerformance(req.businessId),
            analytics.generateInsights(req.businessId)
        ]);

        res.json({
            success: true,
            data: {
                realTimeMetrics: analyticsData[0],
                customerInsights: analyticsData[1],
                servicePerformance: analyticsData[2],
                staffPerformance: analyticsData[3],
                insights: analyticsData[4]
            }
        });

    } catch (error) {
        console.error('Analytics dashboard error:', error);
        res.status(500).json({ error: 'Failed to load analytics data' });
    }
});

// Get services analytics
router.get('/services/:businessId', businessAuth, checkFeatureAccess('smart_analytics'), async (req, res) => {
    try {
        const analytics = new AnalyticsService();
        const servicesData = await analytics.getServicePerformance(req.businessId);

        res.json({
            success: true,
            data: servicesData
        });

    } catch (error) {
        console.error('Services analytics error:', error);
        res.status(500).json({ error: 'Failed to load services analytics' });
    }
});

// Get booking trends
router.get('/trends/:businessId', businessAuth, checkFeatureAccess('smart_analytics'), async (req, res) => {
    try {
        const { days = 30 } = req.query;
        const analytics = new AnalyticsService();
        const trendData = await analytics.getBookingTrend(req.businessId, parseInt(days));

        res.json({
            success: true,
            data: trendData
        });

    } catch (error) {
        console.error('Trends analytics error:', error);
        res.status(500).json({ error: 'Failed to load booking trends' });
    }
});

// Get smart insights
router.get('/insights/:businessId', businessAuth, checkFeatureAccess('smart_analytics'), async (req, res) => {
    try {
        const analytics = new AnalyticsService();
        const insights = await analytics.generateInsights(req.businessId);

        res.json({
            success: true,
            data: insights
        });

    } catch (error) {
        console.error('Smart insights error:', error);
        res.status(500).json({ error: 'Failed to generate insights' });
    }
});

// Export analytics data (Professional+ only)
router.get('/export/:businessId', businessAuth, checkFeatureAccess('advanced_reporting'), async (req, res) => {
    try {
        const { dateRange = 'month', format = 'json' } = req.query;
        const analytics = new AnalyticsService();

        const analyticsData = await Promise.all([
            analytics.getRealTimeMetrics(req.businessId),
            analytics.getCustomerInsights(req.businessId),
            analytics.getServicePerformance(req.businessId)
        ]);

        const exportData = {
            realTimeMetrics: analyticsData[0],
            customerInsights: analyticsData[1],
            servicePerformance: analyticsData[2]
        };

        if (format === 'csv') {
            // Convert to CSV format
            const csv = convertToCSV(exportData);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="analytics-${req.businessId}-${dateRange}.csv"`);
            res.send(csv);
        } else {
            // Return JSON
            res.json({
                success: true,
                exported_at: new Date().toISOString(),
                business_id: req.businessId,
                date_range: dateRange,
                data: exportData
            });
        }

    } catch (error) {
        console.error('Export analytics error:', error);
        res.status(500).json({ error: 'Failed to export analytics data' });
    }
});

// Helper function to convert analytics data to CSV
function convertToCSV(data) {
    const headers = ['Date', 'Revenue', 'Bookings', 'New Customers', 'Retention Rate'];
    const rows = [];

    // Add revenue data
    if (data.realTimeMetrics) {
        rows.push([
            new Date().toISOString().split('T')[0],
            data.realTimeMetrics.monthlyRevenue,
            data.realTimeMetrics.todayAppointments,
            data.customerInsights.newCustomersThisMonth,
            data.customerInsights.customerRetentionRate
        ]);
    }

    // Add service data
    if (data.servicePerformance) {
        rows.push(['', '', '', '', '']); // Empty row
        rows.push(['Service Performance', '', '', '', '']);
        rows.push(['Service Name', 'Bookings', 'Revenue', 'Avg Duration', 'Satisfaction']);

        data.servicePerformance.forEach(service => {
            rows.push([
                service.name,
                service.bookings,
                service.revenue,
                service.avgDuration,
                'N/A' // satisfaction placeholder
            ]);
        });
    }

    return [headers, ...rows].map(row => row.join(',')).join('\n');
}

module.exports = router;