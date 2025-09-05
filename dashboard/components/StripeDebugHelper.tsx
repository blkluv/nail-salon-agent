'use client'

import React from 'react'
import { useStripe, useElements } from '@stripe/react-stripe-js'

export default function StripeDebugHelper() {
  const stripe = useStripe()
  const elements = useElements()

  const debugInfo = {
    stripeLoaded: !!stripe,
    elementsLoaded: !!elements,
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 
      `${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.substring(0, 12)}...` : 
      'Not set',
    timestamp: new Date().toISOString()
  }

  return (
    <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 text-sm">
      <h4 className="font-semibold text-gray-800 mb-2">🔧 Stripe Debug Info</h4>
      <div className="space-y-1 text-gray-700">
        <div>Stripe Client: <span className={debugInfo.stripeLoaded ? 'text-green-600' : 'text-red-600'}>{debugInfo.stripeLoaded ? '✅ Loaded' : '❌ Not Loaded'}</span></div>
        <div>Elements: <span className={debugInfo.elementsLoaded ? 'text-green-600' : 'text-red-600'}>{debugInfo.elementsLoaded ? '✅ Loaded' : '❌ Not Loaded'}</span></div>
        <div>Publishable Key: <span className="font-mono">{debugInfo.publishableKey}</span></div>
        <div>Time: {debugInfo.timestamp}</div>
      </div>
      {(!stripe || !elements) && (
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-xs">
          ⚠️ If Stripe isn't loading, check your publishable key in .env.local
        </div>
      )}
    </div>
  )
}