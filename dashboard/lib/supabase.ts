import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export interface Business {
  id: string
  name: string
  slug: string
  business_type: 'nail_salon' | 'spa' | 'beauty_clinic' | 'barbershop'
  phone: string
  email: string
  address_line1: string
  city: string
  state: string
  subscription_tier: 'starter' | 'professional' | 'enterprise'
  subscription_status: 'trial' | 'active' | 'suspended' | 'cancelled'
  created_at: string
}

export interface Appointment {
  id: string
  business_id: string
  booking_id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  service_type: string
  service_duration: number
  service_price: number
  appointment_date: string
  start_time: string
  end_time: string
  technician_name: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
  payment_status: 'pending' | 'paid' | 'partially_paid' | 'refunded'
  created_at: string
}

export interface Service {
  id: string
  business_id: string
  service_code: string
  name: string
  description: string
  duration_minutes: number
  price: number
  category: string
  is_active: boolean
}

export interface Technician {
  id: string
  business_id: string
  name: string
  email: string
  phone: string
  specialties: string[]
  is_active: boolean
  schedule: Record<string, any>
}

export interface Customer {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  created_at: string
}

export interface BusinessCustomer {
  id: string
  business_id: string
  customer_id: string
  customer: Customer
  total_visits: number
  total_spent: number
  last_visit_date: string
  status: 'active' | 'inactive'
}

// Helper functions for database operations
export class BusinessAPI {
  static async getBusiness(businessId: string): Promise<Business | null> {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single()
    
    if (error) throw error
    return data
  }

  static async getAppointments(businessId: string, filters?: {
    date?: string
    status?: string
    technician?: string
  }): Promise<Appointment[]> {
    let query = supabase
      .from('appointments')
      .select('*')
      .eq('business_id', businessId)
      .order('appointment_date', { ascending: false })
      .order('start_time', { ascending: true })

    if (filters?.date) {
      query = query.eq('appointment_date', filters.date)
    }
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.technician) {
      query = query.eq('technician_name', filters.technician)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  static async getTechnicians(businessId: string): Promise<Technician[]> {
    const { data, error } = await supabase
      .from('technicians')
      .select('*')
      .eq('business_id', businessId)
      .eq('is_active', true)
      .order('name')

    if (error) throw error
    return data || []
  }

  static async getServices(businessId: string): Promise<Service[]> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('business_id', businessId)
      .eq('is_active', true)
      .order('name')

    if (error) throw error
    return data || []
  }

  static async getCustomers(businessId: string): Promise<BusinessCustomer[]> {
    const { data, error } = await supabase
      .from('business_customers')
      .select(`
        *,
        customer:customers(*)
      `)
      .eq('business_id', businessId)
      .eq('status', 'active')
      .order('last_visit_date', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async getDashboardStats(businessId: string): Promise<{
    totalAppointments: number
    todayAppointments: number
    monthlyRevenue: number
    activeCustomers: number
  }> {
    const today = new Date().toISOString().split('T')[0]
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]

    // Get appointments for stats
    const { data: appointments } = await supabase
      .from('appointments')
      .select('appointment_date, service_price, status')
      .eq('business_id', businessId)

    const totalAppointments = appointments?.length || 0
    const todayAppointments = appointments?.filter(apt => apt.appointment_date === today).length || 0
    const monthlyRevenue = appointments
      ?.filter(apt => apt.appointment_date >= startOfMonth && apt.status === 'completed')
      ?.reduce((sum, apt) => sum + (apt.service_price || 0), 0) || 0

    // Get active customers count
    const { count: activeCustomers } = await supabase
      .from('business_customers')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .eq('status', 'active')

    return {
      totalAppointments,
      todayAppointments,
      monthlyRevenue,
      activeCustomers: activeCustomers || 0
    }
  }
}