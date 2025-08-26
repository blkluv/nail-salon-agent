-- Analytics Queries for Vapi Nail Salon Agent
-- Business Intelligence and Reporting for Production Environment
-- Business ID: 8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad

-- ==================== REVENUE ANALYTICS ====================

-- Daily Revenue Report
SELECT 
    appointment_date,
    COUNT(*) as total_appointments,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_appointments,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_appointments,
    COUNT(CASE WHEN status = 'no_show' THEN 1 END) as no_show_appointments,
    ROUND(AVG(CASE WHEN s.price IS NOT NULL THEN s.price ELSE 45 END), 2) as avg_service_price,
    ROUND(SUM(CASE 
        WHEN a.status = 'completed' AND s.price IS NOT NULL THEN s.price 
        WHEN a.status = 'completed' AND s.price IS NULL THEN 45
        ELSE 0 
    END), 2) as total_revenue,
    ROUND(COUNT(CASE WHEN status = 'completed' THEN 1 END) * 100.0 / COUNT(*), 2) as completion_rate
FROM appointments a
LEFT JOIN services s ON a.service_id = s.id
WHERE a.business_id = '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad'
    AND appointment_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY appointment_date
ORDER BY appointment_date DESC;

-- Monthly Revenue Summary
SELECT 
    DATE_TRUNC('month', appointment_date) as month,
    COUNT(*) as total_bookings,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_appointments,
    ROUND(SUM(CASE 
        WHEN a.status = 'completed' AND s.price IS NOT NULL THEN s.price 
        WHEN a.status = 'completed' AND s.price IS NULL THEN 45
        ELSE 0 
    END), 2) as monthly_revenue,
    ROUND(AVG(CASE WHEN s.price IS NOT NULL THEN s.price ELSE 45 END), 2) as avg_ticket_size,
    COUNT(DISTINCT customer_phone) as unique_customers,
    ROUND(COUNT(CASE WHEN status = 'completed' THEN 1 END) * 100.0 / COUNT(*), 2) as completion_rate
FROM appointments a
LEFT JOIN services s ON a.service_id = s.id
WHERE a.business_id = '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad'
    AND appointment_date >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', appointment_date)
ORDER BY month DESC;

-- Revenue by Service Type
SELECT 
    CASE 
        WHEN s.name IS NOT NULL THEN s.name
        WHEN a.customer_name IS NOT NULL THEN 
            CASE 
                WHEN LOWER(a.customer_name) LIKE '%gel%' THEN 'Gel Manicure'
                WHEN LOWER(a.customer_name) LIKE '%pedicure%' THEN 'Classic Pedicure'
                WHEN LOWER(a.customer_name) LIKE '%combo%' THEN 'Combo Package'
                WHEN LOWER(a.customer_name) LIKE '%enhancement%' THEN 'Nail Enhancement'
                ELSE 'Signature Manicure'
            END
        ELSE 'Unknown Service'
    END as service_name,
    COUNT(*) as total_bookings,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_services,
    ROUND(AVG(CASE 
        WHEN s.price IS NOT NULL THEN s.price 
        WHEN LOWER(a.customer_name) LIKE '%gel%' THEN 45
        WHEN LOWER(a.customer_name) LIKE '%pedicure%' THEN 50
        WHEN LOWER(a.customer_name) LIKE '%combo%' THEN 80
        WHEN LOWER(a.customer_name) LIKE '%enhancement%' THEN 60
        ELSE 35
    END), 2) as avg_price,
    ROUND(SUM(CASE 
        WHEN a.status = 'completed' AND s.price IS NOT NULL THEN s.price
        WHEN a.status = 'completed' AND LOWER(a.customer_name) LIKE '%gel%' THEN 45
        WHEN a.status = 'completed' AND LOWER(a.customer_name) LIKE '%pedicure%' THEN 50
        WHEN a.status = 'completed' AND LOWER(a.customer_name) LIKE '%combo%' THEN 80
        WHEN a.status = 'completed' AND LOWER(a.customer_name) LIKE '%enhancement%' THEN 60
        WHEN a.status = 'completed' THEN 35
        ELSE 0
    END), 2) as total_revenue,
    ROUND(COUNT(CASE WHEN status = 'completed' THEN 1 END) * 100.0 / COUNT(*), 2) as completion_rate
FROM appointments a
LEFT JOIN services s ON a.service_id = s.id
WHERE a.business_id = '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad'
    AND appointment_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY service_name
ORDER BY total_revenue DESC;

-- ==================== CUSTOMER ANALYTICS ====================

-- Customer Retention Analysis
SELECT 
    customer_phone,
    customer_name,
    MIN(appointment_date) as first_visit,
    MAX(appointment_date) as last_visit,
    COUNT(*) as total_visits,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_visits,
    ROUND(AVG(CASE 
        WHEN s.price IS NOT NULL THEN s.price 
        ELSE 45 
    END), 2) as avg_spend_per_visit,
    ROUND(SUM(CASE 
        WHEN a.status = 'completed' AND s.price IS NOT NULL THEN s.price 
        WHEN a.status = 'completed' THEN 45
        ELSE 0 
    END), 2) as lifetime_value,
    CASE 
        WHEN COUNT(*) >= 5 THEN 'VIP (5+ visits)'
        WHEN COUNT(*) >= 3 THEN 'Regular (3-4 visits)'
        WHEN COUNT(*) = 2 THEN 'Return Customer'
        ELSE 'New Customer'
    END as customer_tier
FROM appointments a
LEFT JOIN services s ON a.service_id = s.id
WHERE a.business_id = '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad'
    AND customer_phone IS NOT NULL
GROUP BY customer_phone, customer_name
HAVING COUNT(*) > 1  -- Only returning customers
ORDER BY total_visits DESC, lifetime_value DESC;

-- New vs Returning Customer Analysis
WITH customer_visits AS (
    SELECT 
        customer_phone,
        COUNT(*) as visit_count,
        MIN(appointment_date) as first_visit_date,
        MAX(appointment_date) as last_visit_date
    FROM appointments
    WHERE business_id = '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad'
        AND customer_phone IS NOT NULL
        AND status = 'completed'
    GROUP BY customer_phone
)
SELECT 
    DATE_TRUNC('week', appointment_date) as week,
    COUNT(CASE WHEN cv.visit_count = 1 THEN 1 END) as new_customers,
    COUNT(CASE WHEN cv.visit_count > 1 THEN 1 END) as returning_customers,
    COUNT(*) as total_customers,
    ROUND(COUNT(CASE WHEN cv.visit_count > 1 THEN 1 END) * 100.0 / COUNT(*), 2) as retention_rate
FROM appointments a
JOIN customer_visits cv ON a.customer_phone = cv.customer_phone
WHERE a.business_id = '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad'
    AND a.status = 'completed'
    AND appointment_date >= CURRENT_DATE - INTERVAL '8 weeks'
GROUP BY week
ORDER BY week DESC;

-- Customer Lifetime Value Segments
SELECT 
    CASE 
        WHEN lifetime_value >= 200 THEN 'High Value ($200+)'
        WHEN lifetime_value >= 100 THEN 'Medium Value ($100-199)'
        WHEN lifetime_value >= 50 THEN 'Low Value ($50-99)'
        ELSE 'Very Low Value (<$50)'
    END as value_segment,
    COUNT(*) as customer_count,
    ROUND(AVG(lifetime_value), 2) as avg_lifetime_value,
    ROUND(AVG(total_visits), 1) as avg_visits,
    ROUND(SUM(lifetime_value), 2) as segment_total_value,
    ROUND(SUM(lifetime_value) * 100.0 / SUM(SUM(lifetime_value)) OVER(), 2) as percent_of_total_revenue
FROM (
    SELECT 
        customer_phone,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as total_visits,
        ROUND(SUM(CASE 
            WHEN a.status = 'completed' AND s.price IS NOT NULL THEN s.price 
            WHEN a.status = 'completed' THEN 45
            ELSE 0 
        END), 2) as lifetime_value
    FROM appointments a
    LEFT JOIN services s ON a.service_id = s.id
    WHERE a.business_id = '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad'
        AND customer_phone IS NOT NULL
    GROUP BY customer_phone
) customer_stats
GROUP BY value_segment
ORDER BY avg_lifetime_value DESC;

-- ==================== BOOKING SOURCE ANALYTICS ====================

-- Bookings by Source (Voice AI vs Other)
SELECT 
    COALESCE(booking_source, 'unknown') as source,
    COUNT(*) as total_bookings,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_bookings,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings,
    COUNT(CASE WHEN status = 'no_show' THEN 1 END) as no_shows,
    ROUND(COUNT(CASE WHEN status = 'completed' THEN 1 END) * 100.0 / COUNT(*), 2) as completion_rate,
    ROUND(COUNT(CASE WHEN status = 'cancelled' THEN 1 END) * 100.0 / COUNT(*), 2) as cancellation_rate,
    ROUND(AVG(EXTRACT(EPOCH FROM (created_at - LAG(created_at) OVER (ORDER BY created_at)))/60), 2) as avg_minutes_between_bookings
FROM appointments
WHERE business_id = '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad'
    AND appointment_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY booking_source
ORDER BY total_bookings DESC;

-- Voice AI Performance by Time of Day
SELECT 
    CASE 
        WHEN EXTRACT(HOUR FROM created_at) BETWEEN 0 AND 5 THEN 'Late Night (12-6 AM)'
        WHEN EXTRACT(HOUR FROM created_at) BETWEEN 6 AND 8 THEN 'Early Morning (6-9 AM)'
        WHEN EXTRACT(HOUR FROM created_at) BETWEEN 9 AND 11 THEN 'Morning (9-12 PM)'
        WHEN EXTRACT(HOUR FROM created_at) BETWEEN 12 AND 16 THEN 'Afternoon (12-5 PM)'
        WHEN EXTRACT(HOUR FROM created_at) BETWEEN 17 AND 20 THEN 'Evening (5-9 PM)'
        ELSE 'Night (9 PM-12 AM)'
    END as time_period,
    COUNT(*) as ai_bookings,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
    ROUND(COUNT(CASE WHEN status = 'completed' THEN 1 END) * 100.0 / COUNT(*), 2) as success_rate,
    COUNT(DISTINCT customer_phone) as unique_customers
FROM appointments
WHERE business_id = '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad'
    AND booking_source = 'phone'  -- Voice AI bookings
    AND created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY time_period
ORDER BY ai_bookings DESC;

-- ==================== OPERATIONAL ANALYTICS ====================

-- Busiest Hours Analysis
SELECT 
    start_time,
    COUNT(*) as total_appointments,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
    ROUND(COUNT(CASE WHEN status = 'completed' THEN 1 END) * 100.0 / COUNT(*), 2) as completion_rate,
    ROUND(AVG(duration_minutes), 0) as avg_duration_minutes
FROM appointments
WHERE business_id = '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad'
    AND appointment_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY start_time
ORDER BY total_appointments DESC;

-- Day of Week Performance
SELECT 
    TO_CHAR(appointment_date, 'Day') as day_of_week,
    EXTRACT(DOW FROM appointment_date) as day_number,
    COUNT(*) as total_appointments,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
    ROUND(COUNT(CASE WHEN status = 'completed' THEN 1 END) * 100.0 / COUNT(*), 2) as completion_rate,
    ROUND(AVG(CASE 
        WHEN s.price IS NOT NULL THEN s.price 
        ELSE 45 
    END), 2) as avg_service_price,
    COUNT(DISTINCT customer_phone) as unique_customers
FROM appointments a
LEFT JOIN services s ON a.service_id = s.id
WHERE a.business_id = '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad'
    AND appointment_date >= CURRENT_DATE - INTERVAL '8 weeks'
GROUP BY day_of_week, day_number
ORDER BY day_number;

-- Monthly Booking Trends
SELECT 
    DATE_TRUNC('month', appointment_date) as month,
    COUNT(*) as total_bookings,
    COUNT(CASE WHEN booking_source = 'phone' THEN 1 END) as ai_bookings,
    COUNT(CASE WHEN booking_source != 'phone' OR booking_source IS NULL THEN 1 END) as other_bookings,
    ROUND(COUNT(CASE WHEN booking_source = 'phone' THEN 1 END) * 100.0 / COUNT(*), 2) as ai_booking_percentage,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_appointments,
    COUNT(DISTINCT customer_phone) as unique_customers,
    ROUND(COUNT(DISTINCT customer_phone) * 100.0 / COUNT(*), 2) as unique_customer_rate
FROM appointments
WHERE business_id = '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad'
    AND appointment_date >= CURRENT_DATE - INTERVAL '6 months'
GROUP BY month
ORDER BY month DESC;

-- ==================== CANCELLATION & NO-SHOW ANALYTICS ====================

-- Cancellation Analysis by Lead Time
SELECT 
    CASE 
        WHEN appointment_date - CURRENT_DATE <= 0 THEN 'Same Day'
        WHEN appointment_date - CURRENT_DATE = 1 THEN '1 Day'
        WHEN appointment_date - CURRENT_DATE <= 3 THEN '2-3 Days'
        WHEN appointment_date - CURRENT_DATE <= 7 THEN '4-7 Days'
        ELSE '1+ Week'
    END as lead_time,
    COUNT(*) as total_bookings,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancellations,
    COUNT(CASE WHEN status = 'no_show' THEN 1 END) as no_shows,
    ROUND(COUNT(CASE WHEN status = 'cancelled' THEN 1 END) * 100.0 / COUNT(*), 2) as cancellation_rate,
    ROUND(COUNT(CASE WHEN status = 'no_show' THEN 1 END) * 100.0 / COUNT(*), 2) as no_show_rate
FROM appointments
WHERE business_id = '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad'
    AND appointment_date >= CURRENT_DATE - INTERVAL '60 days'
GROUP BY lead_time
ORDER BY 
    CASE lead_time
        WHEN 'Same Day' THEN 1
        WHEN '1 Day' THEN 2
        WHEN '2-3 Days' THEN 3
        WHEN '4-7 Days' THEN 4
        ELSE 5
    END;

-- Service-Specific Cancellation Rates
SELECT 
    CASE 
        WHEN s.name IS NOT NULL THEN s.name
        ELSE 'Unknown Service'
    END as service_name,
    COUNT(*) as total_bookings,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
    COUNT(CASE WHEN status = 'no_show' THEN 1 END) as no_shows,
    ROUND(COUNT(CASE WHEN status = 'cancelled' THEN 1 END) * 100.0 / COUNT(*), 2) as cancellation_rate,
    ROUND(COUNT(CASE WHEN status = 'completed' THEN 1 END) * 100.0 / COUNT(*), 2) as completion_rate
FROM appointments a
LEFT JOIN services s ON a.service_id = s.id
WHERE a.business_id = '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad'
    AND appointment_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY service_name
ORDER BY total_bookings DESC;

-- ==================== FINANCIAL PROJECTIONS ====================

-- Revenue Forecast Based on Booking Trends
WITH monthly_stats AS (
    SELECT 
        DATE_TRUNC('month', appointment_date) as month,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_appointments,
        ROUND(AVG(CASE 
            WHEN s.price IS NOT NULL THEN s.price 
            ELSE 45 
        END), 2) as avg_ticket_size,
        ROUND(SUM(CASE 
            WHEN a.status = 'completed' AND s.price IS NOT NULL THEN s.price 
            WHEN a.status = 'completed' THEN 45
            ELSE 0 
        END), 2) as monthly_revenue
    FROM appointments a
    LEFT JOIN services s ON a.service_id = s.id
    WHERE a.business_id = '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad'
        AND appointment_date >= CURRENT_DATE - INTERVAL '6 months'
        AND appointment_date < CURRENT_DATE
    GROUP BY month
)
SELECT 
    'Historical Average' as period_type,
    ROUND(AVG(completed_appointments), 0) as avg_appointments,
    ROUND(AVG(avg_ticket_size), 2) as avg_ticket_size,
    ROUND(AVG(monthly_revenue), 2) as avg_monthly_revenue,
    ROUND(AVG(monthly_revenue) * 12, 2) as projected_annual_revenue
FROM monthly_stats;

-- ==================== DASHBOARD SUMMARY METRICS ====================

-- Key Performance Indicators (Last 30 Days)
SELECT 
    'Last 30 Days Summary' as report_period,
    COUNT(*) as total_bookings,
    COUNT(CASE WHEN booking_source = 'phone' THEN 1 END) as ai_bookings,
    ROUND(COUNT(CASE WHEN booking_source = 'phone' THEN 1 END) * 100.0 / COUNT(*), 2) as ai_booking_percentage,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_appointments,
    ROUND(COUNT(CASE WHEN status = 'completed' THEN 1 END) * 100.0 / COUNT(*), 2) as completion_rate,
    COUNT(DISTINCT customer_phone) as unique_customers,
    COUNT(DISTINCT CASE WHEN status = 'completed' THEN customer_phone END) as customers_served,
    ROUND(SUM(CASE 
        WHEN a.status = 'completed' AND s.price IS NOT NULL THEN s.price 
        WHEN a.status = 'completed' THEN 45
        ELSE 0 
    END), 2) as total_revenue,
    ROUND(AVG(CASE 
        WHEN s.price IS NOT NULL THEN s.price 
        ELSE 45 
    END), 2) as avg_ticket_size
FROM appointments a
LEFT JOIN services s ON a.service_id = s.id
WHERE a.business_id = '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad'
    AND appointment_date >= CURRENT_DATE - INTERVAL '30 days';

-- Weekly Growth Comparison
WITH weekly_stats AS (
    SELECT 
        DATE_TRUNC('week', appointment_date) as week,
        COUNT(*) as bookings,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        ROUND(SUM(CASE 
            WHEN a.status = 'completed' AND s.price IS NOT NULL THEN s.price 
            WHEN a.status = 'completed' THEN 45
            ELSE 0 
        END), 2) as revenue
    FROM appointments a
    LEFT JOIN services s ON a.service_id = s.id
    WHERE a.business_id = '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad'
        AND appointment_date >= CURRENT_DATE - INTERVAL '8 weeks'
    GROUP BY week
)
SELECT 
    week,
    bookings,
    completed,
    revenue,
    LAG(bookings) OVER (ORDER BY week) as prev_week_bookings,
    LAG(revenue) OVER (ORDER BY week) as prev_week_revenue,
    ROUND(((bookings - LAG(bookings) OVER (ORDER BY week)) * 100.0 / 
           NULLIF(LAG(bookings) OVER (ORDER BY week), 0)), 2) as booking_growth_percent,
    ROUND(((revenue - LAG(revenue) OVER (ORDER BY week)) * 100.0 / 
           NULLIF(LAG(revenue) OVER (ORDER BY week), 0)), 2) as revenue_growth_percent
FROM weekly_stats
ORDER BY week DESC;

-- ==================== OPTIMIZATION SUGGESTIONS ====================

-- Time Slots with Low Utilization (Opportunities)
SELECT 
    start_time,
    EXTRACT(DOW FROM appointment_date) as day_of_week,
    TO_CHAR(appointment_date, 'Day') as day_name,
    COUNT(*) as bookings,
    CASE 
        WHEN COUNT(*) < 2 THEN 'High Availability'
        WHEN COUNT(*) < 4 THEN 'Good Availability' 
        WHEN COUNT(*) < 6 THEN 'Moderate Availability'
        ELSE 'High Demand'
    END as availability_status,
    'Consider promotional pricing' as suggestion
FROM appointments
WHERE business_id = '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad'
    AND appointment_date >= CURRENT_DATE - INTERVAL '4 weeks'
    AND appointment_date < CURRENT_DATE + INTERVAL '1 week'
GROUP BY start_time, EXTRACT(DOW FROM appointment_date), TO_CHAR(appointment_date, 'Day')
HAVING COUNT(*) < 3  -- Low utilization threshold
ORDER BY day_of_week, start_time;