import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types that match our schema
export interface Business {
  id: string
  name: string
  slug: string
  business_type: string
  phone?: string
  email?: string
  website?: string
  address_line1?: string
  address_line2?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
  timezone?: string
  subscription_tier: 'starter' | 'professional' | 'enterprise'
  subscription_status: 'active' | 'cancelled' | 'past_due' | 'trialing'
  trial_ends_at?: string
  settings?: {
    currency?: string
    booking_buffer_minutes?: number
    cancellation_window_hours?: number
    selected_plan?: string
    selected_addons?: string[]
    monthly_price?: number
  }
  created_at: string
  updated_at: string
}

export interface Staff {
  id: string
  business_id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  role: 'owner' | 'manager' | 'technician' | 'receptionist'
  specialties: string[]
  hourly_rate?: number
  commission_rate?: number
  is_active: boolean
  hire_date?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  business_id: string
  name: string
  description?: string
  duration_minutes: number
  base_price: number
  category?: string
  is_active: boolean
  requires_deposit: boolean
  deposit_amount: number
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  business_id: string
  first_name: string
  last_name: string
  email?: string
  phone: string
  date_of_birth?: string
  notes?: string
  preferences?: any
  total_visits: number
  total_spent: number
  last_visit_date?: string
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  business_id: string
  customer_id: string
  staff_id?: string
  service_id: string
  appointment_date: string
  start_time: string
  end_time: string
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  notes?: string
  internal_notes?: string
  reminder_sent: boolean
  created_at: string
  updated_at: string
  // Related data
  customer?: Customer
  staff?: Staff
  service?: Service
}

export interface Payment {
  id: string
  business_id: string
  appointment_id: string
  customer_id: string
  amount: number
  tip_amount: number
  tax_amount: number
  total_amount: number
  payment_method?: string
  status: 'pending' | 'paid' | 'partially_paid' | 'refunded' | 'failed'
  stripe_payment_intent_id?: string
  processed_at?: string
  created_at: string
  updated_at: string
}

// Analytics and dashboard types
export interface DashboardStats {
  totalAppointments: number
  todayAppointments: number
  monthlyRevenue: number
  activeCustomers: number
}

export interface RevenueData {
  month: string
  revenue: number
  appointments: number
}

export interface ServicePopularity {
  name: string
  value: number
  color: string
}

export interface StaffPerformance {
  name: string
  appointments: number
  revenue: number
  rating: number
}

// API class with real database operations
export class BusinessAPI {
  static async getBusiness(businessId: string): Promise<Business | null> {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single()
    
    if (error) {
      console.error('Error fetching business:', error)
      return null
    }
    return data
  }

  static async getAppointments(businessId: string, filters?: {
    date?: string
    status?: string
    staff_id?: string
    limit?: number
  }): Promise<Appointment[]> {
    let query = supabase
      .from('appointments')
      .select(`
        *,
        customer:customers(*),
        staff:staff(*),
        service:services(*)
      `)
      .eq('business_id', businessId)
      .order('appointment_date', { ascending: false })
      .order('start_time', { ascending: true })

    if (filters?.date) {
      query = query.eq('appointment_date', filters.date)
    }
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.staff_id) {
      query = query.eq('staff_id', filters.staff_id)
    }
    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    const { data, error } = await query
    if (error) {
      console.error('Error fetching appointments:', error)
      return []
    }
    return data || []
  }

  static async getUpcomingAppointments(businessId: string, limit = 10): Promise<Appointment[]> {
    const today = new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        customer:customers(*),
        staff:staff(*),
        service:services(*)
      `)
      .eq('business_id', businessId)
      .gte('appointment_date', today)
      .in('status', ['pending', 'confirmed'])
      .order('appointment_date', { ascending: true })
      .order('start_time', { ascending: true })
      .limit(limit)

    if (error) {
      console.error('Error fetching upcoming appointments:', error)
      return []
    }
    return data || []
  }

  static async getStaff(businessId: string): Promise<Staff[]> {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('business_id', businessId)
      .eq('is_active', true)
      .order('first_name')

    if (error) {
      console.error('Error fetching staff:', error)
      return []
    }
    return data || []
  }

  static async getServices(businessId: string): Promise<Service[]> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('business_id', businessId)
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching services:', error)
      return []
    }
    return data || []
  }

  static async getCustomers(businessId: string, limit = 50): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('business_id', businessId)
      .order('last_visit_date', { ascending: false, nullsFirst: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching customers:', error)
      return []
    }
    return data || []
  }

  static async getDashboardStats(businessId: string): Promise<DashboardStats> {
    const today = new Date().toISOString().split('T')[0]
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]

    try {
      // Get total appointments count
      const { count: totalAppointments } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', businessId)

      // Get today's appointments
      const { count: todayAppointments } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', businessId)
        .eq('appointment_date', today)
        .in('status', ['confirmed', 'in_progress'])

      // Get monthly revenue from payments
      const { data: monthlyPayments } = await supabase
        .from('payments')
        .select('total_amount')
        .eq('business_id', businessId)
        .eq('status', 'paid')
        .gte('created_at', startOfMonth)

      const monthlyRevenue = monthlyPayments?.reduce((sum, payment) => sum + payment.total_amount, 0) || 0

      // Get active customers count
      const { count: activeCustomers } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', businessId)
        .gt('total_visits', 0)

      return {
        totalAppointments: totalAppointments || 0,
        todayAppointments: todayAppointments || 0,
        monthlyRevenue: monthlyRevenue || 0,
        activeCustomers: activeCustomers || 0
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      return {
        totalAppointments: 0,
        todayAppointments: 0,
        monthlyRevenue: 0,
        activeCustomers: 0
      }
    }
  }

  static async getRevenueData(businessId: string, months = 6): Promise<RevenueData[]> {
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)
    
    const { data: payments, error } = await supabase
      .from('payments')
      .select(`
        total_amount,
        created_at,
        appointment:appointments(appointment_date)
      `)
      .eq('business_id', businessId)
      .eq('status', 'paid')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching revenue data:', error)
      return []
    }

    // Group by month
    const monthlyData: { [key: string]: { revenue: number; appointments: number } } = {}
    
    payments?.forEach(payment => {
      const date = new Date(payment.created_at)
      const monthKey = date.toLocaleDateString('en-US', { month: 'short' })
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { revenue: 0, appointments: 0 }
      }
      
      monthlyData[monthKey].revenue += payment.total_amount
      monthlyData[monthKey].appointments += 1
    })

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      revenue: data.revenue,
      appointments: data.appointments
    }))
  }

  static async getStaffPerformance(businessId: string, limit = 10): Promise<StaffPerformance[]> {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
    
    const { data, error } = await supabase
      .from('staff')
      .select(`
        first_name,
        last_name,
        appointments:appointments!staff_id(
          id,
          status,
          payments:payments(total_amount)
        )
      `)
      .eq('business_id', businessId)
      .eq('is_active', true)
      .in('role', ['technician', 'manager'])
      .gte('appointments.created_at', startOfMonth)
      .eq('appointments.status', 'completed')

    if (error) {
      console.error('Error fetching staff performance:', error)
      return []
    }

    return data?.map(staff => {
      const appointments = staff.appointments?.length || 0
      const revenue = staff.appointments?.reduce((sum: number, apt: any) => 
        sum + (apt.payments?.[0]?.total_amount || 0), 0) || 0
      
      return {
        name: `${staff.first_name} ${staff.last_name}`,
        appointments,
        revenue,
        rating: 4.5 + Math.random() * 0.5 // Mock rating for now
      }
    }).slice(0, limit) || []
  }
}