/**
 * Analytics Functions for Vapi Nail Salon Agent
 * Business Intelligence and Reporting Functions
 */

const { createClient } = require('@supabase/supabase-js');

class NailSalonAnalytics {
    constructor(supabaseUrl, supabaseKey) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
        this.businessId = '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad';
    }

    // ==================== REVENUE ANALYTICS ====================

    async getDailyRevenue(days = 30) {
        const { data, error } = await this.supabase.rpc('get_daily_revenue', {
            business_id: this.businessId,
            days_back: days
        });

        if (error) {
            console.error('Error fetching daily revenue:', error);
            // Fallback query
            return this.executeQuery(`
                SELECT 
                    appointment_date,
                    COUNT(*) as total_appointments,
                    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_appointments,
                    ROUND(SUM(CASE 
                        WHEN status = 'completed' THEN 45
                        ELSE 0 
                    END), 2) as estimated_revenue
                FROM appointments 
                WHERE business_id = $1 
                    AND appointment_date >= CURRENT_DATE - INTERVAL '${days} days'
                GROUP BY appointment_date 
                ORDER BY appointment_date DESC
            `, [this.businessId]);
        }

        return data;
    }

    async getMonthlyRevenueSummary() {
        const { data, error } = await this.supabase
            .from('appointments')
            .select(`
                appointment_date,
                status,
                services (price)
            `)
            .eq('business_id', this.businessId)
            .gte('appointment_date', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

        if (error) {
            console.error('Error fetching monthly revenue:', error);
            return [];
        }

        // Process data to calculate monthly summaries
        const monthlyData = {};
        data.forEach(appointment => {
            const month = appointment.appointment_date.substring(0, 7); // YYYY-MM
            if (!monthlyData[month]) {
                monthlyData[month] = {
                    month,
                    total_bookings: 0,
                    completed_appointments: 0,
                    estimated_revenue: 0
                };
            }
            
            monthlyData[month].total_bookings++;
            if (appointment.status === 'completed') {
                monthlyData[month].completed_appointments++;
                const price = appointment.services?.price || 45; // Default price
                monthlyData[month].estimated_revenue += price;
            }
        });

        return Object.values(monthlyData).sort((a, b) => b.month.localeCompare(a.month));
    }

    async getRevenueByService() {
        const { data, error } = await this.supabase
            .from('appointments')
            .select(`
                status,
                customer_name,
                services (name, price)
            `)
            .eq('business_id', this.businessId)
            .gte('appointment_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

        if (error) {
            console.error('Error fetching service revenue:', error);
            return [];
        }

        // Process service data
        const serviceStats = {};
        data.forEach(appointment => {
            let serviceName = 'Unknown Service';
            let price = 45;

            if (appointment.services?.name) {
                serviceName = appointment.services.name;
                price = appointment.services.price || 45;
            } else if (appointment.customer_name) {
                // Infer service from booking notes
                const name = appointment.customer_name.toLowerCase();
                if (name.includes('gel')) {
                    serviceName = 'Gel Manicure';
                    price = 45;
                } else if (name.includes('pedicure')) {
                    serviceName = 'Classic Pedicure';
                    price = 50;
                } else if (name.includes('combo')) {
                    serviceName = 'Combo Package';
                    price = 80;
                } else if (name.includes('enhancement')) {
                    serviceName = 'Nail Enhancement';
                    price = 60;
                } else {
                    serviceName = 'Signature Manicure';
                    price = 35;
                }
            }

            if (!serviceStats[serviceName]) {
                serviceStats[serviceName] = {
                    service_name: serviceName,
                    total_bookings: 0,
                    completed_services: 0,
                    avg_price: price,
                    total_revenue: 0
                };
            }

            serviceStats[serviceName].total_bookings++;
            if (appointment.status === 'completed') {
                serviceStats[serviceName].completed_services++;
                serviceStats[serviceName].total_revenue += price;
            }
        });

        return Object.values(serviceStats).sort((a, b) => b.total_revenue - a.total_revenue);
    }

    // ==================== CUSTOMER ANALYTICS ====================

    async getCustomerRetention() {
        const { data, error } = await this.supabase
            .from('appointments')
            .select('customer_phone, customer_name, appointment_date, status')
            .eq('business_id', this.businessId)
            .not('customer_phone', 'is', null)
            .order('appointment_date');

        if (error) {
            console.error('Error fetching customer data:', error);
            return [];
        }

        // Process customer visit patterns
        const customerStats = {};
        data.forEach(appointment => {
            const phone = appointment.customer_phone;
            if (!customerStats[phone]) {
                customerStats[phone] = {
                    customer_phone: phone,
                    customer_name: appointment.customer_name,
                    first_visit: appointment.appointment_date,
                    last_visit: appointment.appointment_date,
                    total_visits: 0,
                    completed_visits: 0,
                    lifetime_value: 0
                };
            }

            customerStats[phone].total_visits++;
            customerStats[phone].last_visit = appointment.appointment_date;
            
            if (appointment.status === 'completed') {
                customerStats[phone].completed_visits++;
                customerStats[phone].lifetime_value += 45; // Default price
            }
        });

        // Add customer tiers
        Object.values(customerStats).forEach(customer => {
            if (customer.total_visits >= 5) {
                customer.customer_tier = 'VIP (5+ visits)';
            } else if (customer.total_visits >= 3) {
                customer.customer_tier = 'Regular (3-4 visits)';
            } else if (customer.total_visits === 2) {
                customer.customer_tier = 'Return Customer';
            } else {
                customer.customer_tier = 'New Customer';
            }
        });

        return Object.values(customerStats)
            .filter(c => c.total_visits > 1) // Only returning customers
            .sort((a, b) => b.lifetime_value - a.lifetime_value);
    }

    async getNewVsReturningCustomers(weeks = 8) {
        const startDate = new Date(Date.now() - weeks * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        const { data, error } = await this.supabase
            .from('appointments')
            .select('customer_phone, appointment_date, status')
            .eq('business_id', this.businessId)
            .eq('status', 'completed')
            .gte('appointment_date', startDate)
            .not('customer_phone', 'is', null)
            .order('appointment_date');

        if (error) {
            console.error('Error fetching customer data:', error);
            return [];
        }

        // Get all customer visit counts
        const customerVisitCounts = {};
        const allAppointments = await this.supabase
            .from('appointments')
            .select('customer_phone')
            .eq('business_id', this.businessId)
            .eq('status', 'completed')
            .not('customer_phone', 'is', null);

        if (allAppointments.data) {
            allAppointments.data.forEach(appointment => {
                const phone = appointment.customer_phone;
                customerVisitCounts[phone] = (customerVisitCounts[phone] || 0) + 1;
            });
        }

        // Process weekly data
        const weeklyStats = {};
        data.forEach(appointment => {
            const weekStart = this.getWeekStart(new Date(appointment.appointment_date));
            const weekKey = weekStart.toISOString().split('T')[0];
            
            if (!weeklyStats[weekKey]) {
                weeklyStats[weekKey] = {
                    week: weekKey,
                    new_customers: 0,
                    returning_customers: 0,
                    total_customers: 0
                };
            }

            const visitCount = customerVisitCounts[appointment.customer_phone] || 1;
            if (visitCount === 1) {
                weeklyStats[weekKey].new_customers++;
            } else {
                weeklyStats[weekKey].returning_customers++;
            }
            weeklyStats[weekKey].total_customers++;
        });

        // Calculate retention rates
        Object.values(weeklyStats).forEach(week => {
            if (week.total_customers > 0) {
                week.retention_rate = Math.round((week.returning_customers * 100) / week.total_customers * 100) / 100;
            } else {
                week.retention_rate = 0;
            }
        });

        return Object.values(weeklyStats).sort((a, b) => b.week.localeCompare(a.week));
    }

    // ==================== BOOKING SOURCE ANALYTICS ====================

    async getBookingsBySource(days = 30) {
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        const { data, error } = await this.supabase
            .from('appointments')
            .select('booking_source, status, created_at')
            .eq('business_id', this.businessId)
            .gte('appointment_date', startDate);

        if (error) {
            console.error('Error fetching booking source data:', error);
            return [];
        }

        const sourceStats = {};
        data.forEach(appointment => {
            const source = appointment.booking_source || 'unknown';
            
            if (!sourceStats[source]) {
                sourceStats[source] = {
                    source,
                    total_bookings: 0,
                    completed_bookings: 0,
                    cancelled_bookings: 0,
                    no_shows: 0
                };
            }

            sourceStats[source].total_bookings++;
            
            if (appointment.status === 'completed') {
                sourceStats[source].completed_bookings++;
            } else if (appointment.status === 'cancelled') {
                sourceStats[source].cancelled_bookings++;
            } else if (appointment.status === 'no_show') {
                sourceStats[source].no_shows++;
            }
        });

        // Calculate rates
        Object.values(sourceStats).forEach(source => {
            if (source.total_bookings > 0) {
                source.completion_rate = Math.round((source.completed_bookings * 100) / source.total_bookings * 100) / 100;
                source.cancellation_rate = Math.round((source.cancelled_bookings * 100) / source.total_bookings * 100) / 100;
            }
        });

        return Object.values(sourceStats).sort((a, b) => b.total_bookings - a.total_bookings);
    }

    async getVoiceAIPerformanceByTime(days = 30) {
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        const { data, error } = await this.supabase
            .from('appointments')
            .select('created_at, status, customer_phone')
            .eq('business_id', this.businessId)
            .eq('booking_source', 'phone')
            .gte('created_at', startDate);

        if (error) {
            console.error('Error fetching voice AI data:', error);
            return [];
        }

        const timeStats = {};
        data.forEach(appointment => {
            const hour = new Date(appointment.created_at).getHours();
            let timePeriod;
            
            if (hour >= 0 && hour <= 5) {
                timePeriod = 'Late Night (12-6 AM)';
            } else if (hour >= 6 && hour <= 8) {
                timePeriod = 'Early Morning (6-9 AM)';
            } else if (hour >= 9 && hour <= 11) {
                timePeriod = 'Morning (9-12 PM)';
            } else if (hour >= 12 && hour <= 16) {
                timePeriod = 'Afternoon (12-5 PM)';
            } else if (hour >= 17 && hour <= 20) {
                timePeriod = 'Evening (5-9 PM)';
            } else {
                timePeriod = 'Night (9 PM-12 AM)';
            }

            if (!timeStats[timePeriod]) {
                timeStats[timePeriod] = {
                    time_period: timePeriod,
                    ai_bookings: 0,
                    completed: 0,
                    unique_customers: new Set()
                };
            }

            timeStats[timePeriod].ai_bookings++;
            if (appointment.status === 'completed') {
                timeStats[timePeriod].completed++;
            }
            timeStats[timePeriod].unique_customers.add(appointment.customer_phone);
        });

        // Convert sets to counts and calculate success rates
        const result = Object.values(timeStats).map(stat => ({
            ...stat,
            unique_customers: stat.unique_customers.size,
            success_rate: stat.ai_bookings > 0 ? Math.round((stat.completed * 100) / stat.ai_bookings * 100) / 100 : 0
        }));

        return result.sort((a, b) => b.ai_bookings - a.ai_bookings);
    }

    // ==================== OPERATIONAL ANALYTICS ====================

    async getBusiestHours(days = 30) {
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        const { data, error } = await this.supabase
            .from('appointments')
            .select('start_time, status, duration_minutes')
            .eq('business_id', this.businessId)
            .gte('appointment_date', startDate);

        if (error) {
            console.error('Error fetching time slot data:', error);
            return [];
        }

        const timeStats = {};
        data.forEach(appointment => {
            const time = appointment.start_time;
            
            if (!timeStats[time]) {
                timeStats[time] = {
                    start_time: time,
                    total_appointments: 0,
                    completed: 0,
                    cancelled: 0,
                    avg_duration: 0,
                    durations: []
                };
            }

            timeStats[time].total_appointments++;
            if (appointment.status === 'completed') {
                timeStats[time].completed++;
            } else if (appointment.status === 'cancelled') {
                timeStats[time].cancelled++;
            }
            
            if (appointment.duration_minutes) {
                timeStats[time].durations.push(appointment.duration_minutes);
            }
        });

        // Calculate averages and completion rates
        Object.values(timeStats).forEach(stat => {
            if (stat.durations.length > 0) {
                stat.avg_duration = Math.round(stat.durations.reduce((a, b) => a + b, 0) / stat.durations.length);
            }
            stat.completion_rate = stat.total_appointments > 0 ? 
                Math.round((stat.completed * 100) / stat.total_appointments * 100) / 100 : 0;
        });

        return Object.values(timeStats).sort((a, b) => b.total_appointments - a.total_appointments);
    }

    async getDayOfWeekPerformance(weeks = 8) {
        const startDate = new Date(Date.now() - weeks * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        const { data, error } = await this.supabase
            .from('appointments')
            .select('appointment_date, status, customer_phone')
            .eq('business_id', this.businessId)
            .gte('appointment_date', startDate);

        if (error) {
            console.error('Error fetching day of week data:', error);
            return [];
        }

        const dayStats = {};
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        data.forEach(appointment => {
            const date = new Date(appointment.appointment_date);
            const dayOfWeek = date.getDay();
            const dayName = dayNames[dayOfWeek];
            
            if (!dayStats[dayName]) {
                dayStats[dayName] = {
                    day_of_week: dayName,
                    day_number: dayOfWeek,
                    total_appointments: 0,
                    completed: 0,
                    unique_customers: new Set()
                };
            }

            dayStats[dayName].total_appointments++;
            if (appointment.status === 'completed') {
                dayStats[dayName].completed++;
            }
            dayStats[dayName].unique_customers.add(appointment.customer_phone);
        });

        // Convert sets to counts and calculate rates
        const result = Object.values(dayStats).map(stat => ({
            ...stat,
            unique_customers: stat.unique_customers.size,
            completion_rate: stat.total_appointments > 0 ? 
                Math.round((stat.completed * 100) / stat.total_appointments * 100) / 100 : 0
        }));

        return result.sort((a, b) => a.day_number - b.day_number);
    }

    // ==================== DASHBOARD SUMMARY ====================

    async getDashboardSummary(days = 30) {
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        const { data, error } = await this.supabase
            .from('appointments')
            .select('booking_source, status, customer_phone')
            .eq('business_id', this.businessId)
            .gte('appointment_date', startDate);

        if (error) {
            console.error('Error fetching dashboard data:', error);
            return null;
        }

        const summary = {
            report_period: `Last ${days} Days`,
            total_bookings: data.length,
            ai_bookings: data.filter(a => a.booking_source === 'phone').length,
            completed_appointments: data.filter(a => a.status === 'completed').length,
            unique_customers: new Set(data.map(a => a.customer_phone).filter(p => p)).size,
            customers_served: new Set(data.filter(a => a.status === 'completed').map(a => a.customer_phone).filter(p => p)).size,
            estimated_revenue: data.filter(a => a.status === 'completed').length * 45 // Default price
        };

        // Calculate percentages
        summary.ai_booking_percentage = summary.total_bookings > 0 ? 
            Math.round((summary.ai_bookings * 100) / summary.total_bookings * 100) / 100 : 0;
        summary.completion_rate = summary.total_bookings > 0 ? 
            Math.round((summary.completed_appointments * 100) / summary.total_bookings * 100) / 100 : 0;
        summary.avg_ticket_size = 45; // Default - could be calculated from services table

        return summary;
    }

    // ==================== UTILITY FUNCTIONS ====================

    getWeekStart(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day;
        return new Date(d.setDate(diff));
    }

    async executeQuery(query, params = []) {
        try {
            const { data, error } = await this.supabase.rpc('execute_query', {
                query_text: query,
                params: params
            });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Query execution error:', error);
            return [];
        }
    }

    // ==================== EXPORT FUNCTIONS ====================

    async exportToCSV(data, filename = 'analytics_export.csv') {
        if (!data || data.length === 0) return null;

        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(field => {
                const value = row[field];
                if (typeof value === 'string' && value.includes(',')) {
                    return `"${value}"`;
                }
                return value;
            }).join(','))
        ].join('\n');

        return {
            filename,
            content: csvContent,
            mimeType: 'text/csv'
        };
    }

    async generateAnalyticsReport() {
        const report = {
            generated_at: new Date().toISOString(),
            business_id: this.businessId,
            summary: await this.getDashboardSummary(30),
            revenue: {
                daily: await this.getDailyRevenue(30),
                monthly: await this.getMonthlyRevenueSummary(),
                by_service: await this.getRevenueByService()
            },
            customers: {
                retention: await this.getCustomerRetention(),
                new_vs_returning: await this.getNewVsReturningCustomers(8)
            },
            bookings: {
                by_source: await this.getBookingsBySource(30),
                voice_ai_performance: await this.getVoiceAIPerformanceByTime(30)
            },
            operations: {
                busiest_hours: await this.getBusiestHours(30),
                day_of_week: await this.getDayOfWeekPerformance(8)
            }
        };

        return report;
    }
}

// Usage examples and helper functions
const ANALYTICS_QUERIES = {
    // Quick queries for common dashboard needs
    todaysBookings: `
        SELECT COUNT(*) as count 
        FROM appointments 
        WHERE business_id = $1 AND appointment_date = CURRENT_DATE
    `,
    
    weeklyRevenue: `
        SELECT 
            DATE_TRUNC('week', appointment_date) as week,
            COUNT(CASE WHEN status = 'completed' THEN 1 END) * 45 as estimated_revenue
        FROM appointments 
        WHERE business_id = $1 
            AND appointment_date >= CURRENT_DATE - INTERVAL '4 weeks'
        GROUP BY week 
        ORDER BY week DESC
    `,
    
    topCustomers: `
        SELECT 
            customer_name,
            customer_phone,
            COUNT(*) as visits,
            MAX(appointment_date) as last_visit
        FROM appointments 
        WHERE business_id = $1 
            AND customer_phone IS NOT NULL 
            AND status = 'completed'
        GROUP BY customer_name, customer_phone 
        ORDER BY visits DESC 
        LIMIT 10
    `
};

// Export for use in dashboard
module.exports = {
    NailSalonAnalytics,
    ANALYTICS_QUERIES
};