import { createClient } from '@supabase/supabase-js'
import {
  Location, BusinessWithLocations, PaymentWithDetails, PaymentProcessor,
  LoyaltyProgram, CustomerLoyaltyPoints, LoyaltyTransaction,
  LocationAPI, PaymentAPI, LoyaltyAPI,
  CreateLocationRequest, CreatePaymentRequest, ProcessPaymentResponse,
  LoyaltyRedemptionRequest, PlanTierLimits, LoyaltyCustomer
} from './supabase-types-mvp'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Export MVP types for easy importing
export * from './supabase-types-mvp'

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
  subscription_tier: 'starter' | 'professional' | 'business' | 'enterprise'
  subscription_status: 'active' | 'cancelled' | 'past_due' | 'trialing'
  trial_ends_at?: string
  settings?: {
    currency?: string
    booking_buffer_minutes?: number
    cancellation_window_hours?: number
    selected_plan?: string
    selected_addons?: string[]
    monthly_price?: number
    tech_calendar_count?: number
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
  // MVP additions
  location_id?: string
  total_amount?: number
  raw_appointment?: any
  // Related data
  customer?: Customer
  staff?: Staff
  service?: Service
  location?: Location
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

// MVP Feature API Classes  
export class LocationAPIImpl implements LocationAPI {
  static async getLocations(businessId: string): Promise<Location[]> {
    const instance = new LocationAPIImpl()
    return instance.getLocations(businessId)
  }
  async getLocations(businessId: string): Promise<Location[]> {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('business_id', businessId)
      .eq('is_active', true)
      .order('is_primary', { ascending: false })
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching locations:', error)
      return []
    }
    return data || []
  }

  async createLocation(businessId: string, data: CreateLocationRequest): Promise<Location> {
    // Create slug from name
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    
    const { data: location, error } = await supabase
      .from('locations')
      .insert({
        business_id: businessId,
        slug,
        timezone: data.timezone || 'America/Los_Angeles',
        country: data.country || 'US',
        is_active: true,
        is_primary: false, // Will be set manually if needed
        ...data
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to create location: ${error.message}`)
    return location
  }

  async updateLocation(locationId: string, data: Partial<CreateLocationRequest>): Promise<Location> {
    const { data: location, error } = await supabase
      .from('locations')
      .update(data)
      .eq('id', locationId)
      .select()
      .single()

    if (error) throw new Error(`Failed to update location: ${error.message}`)
    return location
  }

  async deleteLocation(locationId: string): Promise<boolean> {
    // Soft delete by setting is_active to false
    const { error } = await supabase
      .from('locations')
      .update({ is_active: false })
      .eq('id', locationId)

    if (error) throw new Error(`Failed to delete location: ${error.message}`)
    return true
  }

  async setAsPrimary(locationId: string): Promise<boolean> {
    // Get the business_id for this location
    const { data: location } = await supabase
      .from('locations')
      .select('business_id')
      .eq('id', locationId)
      .single()

    if (!location) throw new Error('Location not found')

    // Set all locations for this business to not primary
    await supabase
      .from('locations')
      .update({ is_primary: false })
      .eq('business_id', location.business_id)

    // Set the target location as primary
    const { error } = await supabase
      .from('locations')
      .update({ is_primary: true })
      .eq('id', locationId)

    if (error) throw new Error(`Failed to set primary location: ${error.message}`)
    return true
  }
}

export class PaymentAPIImpl implements PaymentAPI {
  async getPayments(businessId: string, filters?: {
    location_id?: string
    date_range?: [string, string]
    status?: string
    limit?: number
  }): Promise<PaymentWithDetails[]> {
    let query = supabase
      .from('payments')
      .select(`
        *,
        appointment:appointments(*),
        customer:customers(*),
        location:locations(*)
      `)
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })

    if (filters?.location_id) {
      query = query.eq('location_id', filters.location_id)
    }
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.date_range) {
      query = query
        .gte('created_at', filters.date_range[0])
        .lte('created_at', filters.date_range[1])
    }
    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    const { data, error } = await query
    if (error) {
      console.error('Error fetching payments:', error)
      return []
    }
    return data || []
  }

  async createPayment(data: CreatePaymentRequest): Promise<ProcessPaymentResponse> {
    // This would integrate with actual payment processors (Square/Stripe)
    // For now, return a mock implementation
    const payment = {
      id: crypto.randomUUID(),
      business_id: data.customer_id, // This should come from the appointment
      subtotal_amount: data.amount,
      tip_amount: data.tip_amount || 0,
      tax_amount: data.tax_amount || 0,
      discount_amount: data.discount_amount || 0,
      total_amount: data.amount + (data.tip_amount || 0) + (data.tax_amount || 0) - (data.discount_amount || 0),
      processor_type: data.processor_type,
      currency: 'USD',
      status: 'paid' as const,
      payment_method: data.payment_method,
      payment_method_details: {},
      processor_fee_amount: 0,
      processor_webhook_data: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...data
    } as PaymentWithDetails

    return {
      success: true,
      payment,
      loyalty_points_earned: Math.floor(payment.total_amount / 100) // 1 point per dollar
    }
  }

  async refundPayment(paymentId: string, amount?: number, reason?: string): Promise<ProcessPaymentResponse> {
    // Mock implementation - would integrate with actual payment processors
    return {
      success: true,
      error: 'Refund functionality not implemented yet'
    }
  }

  async getPaymentProcessors(businessId: string): Promise<PaymentProcessor[]> {
    const { data, error } = await supabase
      .from('payment_processors')
      .select('*')
      .eq('business_id', businessId)
      .eq('is_active', true)

    if (error) {
      console.error('Error fetching payment processors:', error)
      return []
    }
    return data || []
  }

  async configureProcessor(businessId: string, locationId: string, config: Partial<PaymentProcessor>): Promise<PaymentProcessor> {
    const { data, error } = await supabase
      .from('payment_processors')
      .upsert({
        business_id: businessId,
        location_id: locationId,
        is_active: true,
        auto_capture: true,
        allow_tips: true,
        default_tip_percentages: [15, 18, 20, 25],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...config
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to configure payment processor: ${error.message}`)
    return data
  }
}

export class LoyaltyAPIImpl implements LoyaltyAPI {
  static async getLoyaltyStats(businessId: string): Promise<any> {
    const instance = new LoyaltyAPIImpl()
    return instance.getLoyaltyStats(businessId)
  }
  
  static async getCustomerPoints(businessId: string, customerId: string): Promise<CustomerLoyaltyPoints | null> {
    const instance = new LoyaltyAPIImpl()
    return instance.getCustomerPoints(businessId, customerId)
  }
  
  static async getLoyaltyCustomers(businessId: string): Promise<LoyaltyCustomer[]> {
    const instance = new LoyaltyAPIImpl()
    return instance.getLoyaltyCustomers(businessId)
  }
  async getLoyaltyProgram(businessId: string): Promise<LoyaltyProgram | null> {
    const { data, error } = await supabase
      .from('loyalty_programs')
      .select('*')
      .eq('business_id', businessId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error fetching loyalty program:', error)
      return null
    }
    return data
  }

  async updateLoyaltyProgram(businessId: string, data: Partial<LoyaltyProgram>): Promise<LoyaltyProgram> {
    const { data: program, error } = await supabase
      .from('loyalty_programs')
      .upsert({
        business_id: businessId,
        is_active: true,
        program_name: 'Loyalty Rewards',
        points_per_dollar: 1,
        points_per_visit: 0,
        points_expire_days: 365,
        minimum_purchase_for_points: 0,
        reward_tiers: [
          { points: 100, reward: '$5 off next service', discount_amount: 500 },
          { points: 250, reward: '$15 off next service', discount_amount: 1500 },
          { points: 500, reward: '$35 off next service', discount_amount: 3500 }
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...data
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to update loyalty program: ${error.message}`)
    return program
  }

  async getCustomerPoints(businessId: string, customerId: string): Promise<CustomerLoyaltyPoints | null> {
    const { data, error } = await supabase
      .from('customer_loyalty_points')
      .select('*, customer:customers(*)')
      .eq('business_id', businessId)
      .eq('customer_id', customerId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching customer points:', error)
      return null
    }
    return data
  }

  async getPointsHistory(businessId: string, customerId: string): Promise<LoyaltyTransaction[]> {
    const { data, error } = await supabase
      .from('loyalty_transactions')
      .select('*, customer:customers(*)')
      .eq('business_id', businessId)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching points history:', error)
      return []
    }
    return data || []
  }

  async redeemPoints(data: LoyaltyRedemptionRequest): Promise<boolean> {
    // Mock implementation - would need proper transaction handling
    const { error } = await supabase
      .from('loyalty_transactions')
      .insert({
        business_id: '', // Should be derived from customer
        customer_id: data.customer_id,
        appointment_id: data.appointment_id,
        transaction_type: 'redeemed',
        points_amount: -data.points_to_redeem,
        description: data.description || 'Points redeemed',
        balance_after: 0, // Should be calculated
        created_at: new Date().toISOString()
      })

    return !error
  }

  async adjustPoints(customerId: string, points: number, reason: string): Promise<boolean> {
    // Mock implementation
    return true
  }

  async adjustCustomerPoints(customerId: string, points: number, reason: string): Promise<boolean> {
    // Mock implementation - same as adjustPoints for now
    return this.adjustPoints(customerId, points, reason)
  }

  async getLoyaltyCustomers(businessId: string): Promise<LoyaltyCustomer[]> {
    // Mock implementation - would need to join customers with loyalty data
    return []
  }

  async awardPoints(businessId: string, customerId: string, appointmentId: string, amount: number): Promise<number> {
    // Mock implementation - would calculate points based on amount
    const points = Math.floor(amount / 100) // 1 point per dollar
    return points
  }

  async createLoyaltyProgram(businessId: string, data?: Partial<LoyaltyProgram>): Promise<LoyaltyProgram> {
    // Use existing updateLoyaltyProgram method
    return this.updateLoyaltyProgram(businessId, data || {})
  }

  async updateLoyaltyTier(tierId: string, data: Partial<LoyaltyRewardTier>): Promise<LoyaltyRewardTier> {
    // Mock implementation - would update specific tier
    return {
      points: data.points || 100,
      reward: data.reward || 'Default reward', 
      discount_amount: data.discount_amount || 500,
      ...data
    }
  }

  async getLoyaltyStats(businessId: string): Promise<any> {
    // Mock implementation - would need complex queries
    return {
      total_members: 0,
      total_points_issued: 0,
      total_points_redeemed: 0,
      redemption_rate: 0,
      average_points_per_customer: 0,
      top_rewards: []
    }
  }
}

// Plan tier configuration
export const PLAN_TIER_LIMITS: PlanTierLimits = {
  starter: {
    max_locations: 1,
    payment_processors: [],
    loyalty_program: false,
    monthly_price: 47
  },
  professional: {
    max_locations: 1,
    payment_processors: ['square', 'stripe'],
    loyalty_program: true,
    monthly_price: 97
  },
  business: {
    max_locations: 3,
    payment_processors: ['square', 'stripe'],
    loyalty_program: true,
    monthly_price: 197
  },
  enterprise: {
    max_locations: -1, // unlimited
    payment_processors: ['square', 'stripe'],
    loyalty_program: true,
    monthly_price: 397
  }
}