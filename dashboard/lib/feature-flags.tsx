// Feature Flag System for Tier-Based Access Control
import { PLAN_TIER_LIMITS } from './supabase'

export type PlanTier = 'starter' | 'professional' | 'business' | 'enterprise'
// Define feature keys manually based on what we know exists
export type FeatureKey = 'voice_ai' | 'web_booking' | 'sms_reminders' | 'online_payments' | 'customer_portal' | 'smart_analytics' | 'email_marketing' | 'custom_widget_themes' | 'social_booking' | 'smart_scheduling' | 'loyalty_program' | 'multi_location' | 'team_management' | 'white_label' | 'api_access' | 'advanced_reporting' | 'max_bookings_per_month'

export class FeatureFlags {
  private tier: PlanTier
  
  constructor(tier: PlanTier) {
    this.tier = tier
  }

  // Check if a feature is enabled for current tier
  hasFeature(feature: FeatureKey): boolean {
    const tierLimits = PLAN_TIER_LIMITS[this.tier] as any
    const features = tierLimits.features
    if (!features) {
      // Fallback logic for basic features based on tier
      return this.getBasicFeatureAccess(feature)
    }
    
    return features[feature] === true
  }

  // Fallback logic for basic feature access
  private getBasicFeatureAccess(feature: FeatureKey): boolean {
    switch (this.tier) {
      case 'starter':
        return ['web_booking', 'sms_reminders', 'customer_portal', 'smart_analytics', 'email_marketing', 'custom_widget_themes', 'social_booking', 'smart_scheduling'].includes(feature)
      case 'professional':
        return !['multi_location', 'team_management', 'white_label', 'api_access'].includes(feature)
      case 'business':
        return !['white_label', 'api_access'].includes(feature)
      case 'enterprise':
        return true
      default:
        return false
    }
  }

  // Get feature value (for features that have values, not just boolean)
  getFeatureValue<T>(feature: FeatureKey): T | null {
    const tierLimits = PLAN_TIER_LIMITS[this.tier] as any
    const features = tierLimits.features
    if (!features) {
      // Return some default values for common features
      if (feature === 'max_bookings_per_month') {
        return (this.tier === 'starter' ? 500 : -1) as T
      }
      return null
    }
    
    return features[feature] as T || null
  }

  // Check if user can access a specific page/component
  canAccess(requiredFeatures: FeatureKey[]): boolean {
    return requiredFeatures.every(feature => this.hasFeature(feature))
  }

  // Get tier limits
  getTierLimits() {
    return PLAN_TIER_LIMITS[this.tier]
  }

  // Check if user can add more locations
  canAddLocation(currentLocationCount: number): boolean {
    const maxLocations = PLAN_TIER_LIMITS[this.tier].max_locations
    if (maxLocations === -1) return true // unlimited
    return currentLocationCount < maxLocations
  }

  // Check monthly booking limits
  isWithinBookingLimit(currentBookings: number): boolean {
    const maxBookings = this.getFeatureValue<number>('max_bookings_per_month')
    if (maxBookings === -1) return true // unlimited
    if (!maxBookings) return true // no limit set
    return currentBookings < maxBookings
  }

  // Get upgrade message for blocked features
  getUpgradeMessage(feature: FeatureKey): string {
    const upgradeMessages: Record<FeatureKey, string> = {
      voice_ai: "Upgrade to Professional to get 24/7 voice AI booking that never misses a call!",
      web_booking: "Upgrade to access web booking features",
      sms_reminders: "Upgrade to send automated SMS reminders",
      online_payments: "Upgrade to Professional to accept online payments and boost revenue!",
      customer_portal: "Upgrade to provide customers with a self-service portal",
      smart_analytics: "Upgrade to access advanced analytics and insights",
      email_marketing: "Upgrade to unlock email marketing automation",
      custom_widget_themes: "Upgrade to customize your booking widget appearance",
      social_booking: "Upgrade to enable Instagram and Facebook booking",
      smart_scheduling: "Upgrade to access intelligent scheduling rules",
      advanced_reporting: "Upgrade to Professional for detailed reports and insights!",
      loyalty_program: "Upgrade to Professional to build customer loyalty and increase retention!",
      multi_location: "Upgrade to Business to manage multiple salon locations!",
      team_management: "Upgrade to Business for advanced team management features!",
      white_label: "Contact sales for white-label solutions",
      api_access: "Contact sales for API access and custom integrations",
      max_bookings_per_month: "Upgrade for unlimited bookings per month"
    }

    return upgradeMessages[feature] || "Upgrade your plan to unlock this feature!"
  }

  // Get the next tier for upgrades
  getNextTier(): PlanTier | null {
    const tiers: PlanTier[] = ['starter', 'professional', 'business', 'enterprise']
    const currentIndex = tiers.indexOf(this.tier)
    
    if (currentIndex === -1 || currentIndex === tiers.length - 1) {
      return null // Already at highest tier
    }
    
    return tiers[currentIndex + 1]
  }

  // Get features that would be unlocked with upgrade
  getFeaturesUnlockedByUpgrade(): FeatureKey[] {
    const nextTier = this.getNextTier()
    if (!nextTier) return []

    const currentFeatures = (PLAN_TIER_LIMITS[this.tier] as any).features || {}
    const nextFeatures = (PLAN_TIER_LIMITS[nextTier] as any).features || {}

    return Object.keys(nextFeatures).filter(key => {
      const featureKey = key as FeatureKey
      return nextFeatures[featureKey] && !currentFeatures[featureKey]
    }) as FeatureKey[]
  }
}

// React hook for feature flags
export function useFeatureFlags(tier: PlanTier) {
  return new FeatureFlags(tier)
}

// Higher-order component for feature gating
import { ReactNode } from 'react'

interface FeatureGateProps {
  tier: PlanTier
  requiredFeatures: FeatureKey[]
  fallback?: ReactNode
  children: ReactNode
  showUpgradePrompt?: boolean
}

export function FeatureGate({ 
  tier, 
  requiredFeatures, 
  fallback, 
  children, 
  showUpgradePrompt = false 
}: FeatureGateProps) {
  const flags = new FeatureFlags(tier)
  
  if (!flags.canAccess(requiredFeatures)) {
    if (showUpgradePrompt) {
      const feature = requiredFeatures[0] // Show message for first required feature
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-yellow-800">
                {flags.getUpgradeMessage(feature)}
              </p>
              <button className="mt-2 text-xs bg-yellow-600 text-white px-3 py-1 rounded-md hover:bg-yellow-700">
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      )
    }
    
    return fallback || null
  }
  
  return <>{children}</>
}

// Utility functions for common checks
export const FeatureChecks = {
  canUseVoiceAI: (tier: PlanTier) => new FeatureFlags(tier).hasFeature('voice_ai'),
  canProcessPayments: (tier: PlanTier) => new FeatureFlags(tier).hasFeature('online_payments'),
  canUseLoyalty: (tier: PlanTier) => new FeatureFlags(tier).hasFeature('loyalty_program'),
  canHaveMultipleLocations: (tier: PlanTier) => new FeatureFlags(tier).hasFeature('multi_location'),
  canManageTeam: (tier: PlanTier) => new FeatureFlags(tier).hasFeature('team_management'),
  
  // Get max locations for tier
  getMaxLocations: (tier: PlanTier) => PLAN_TIER_LIMITS[tier].max_locations,
  
  // Get monthly price for tier
  getPrice: (tier: PlanTier) => PLAN_TIER_LIMITS[tier].monthly_price
}