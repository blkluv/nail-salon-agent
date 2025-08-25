'use client'

import { useParams } from 'next/navigation'
import BookingWidget from '../../../components/BookingWidget'

export default function WidgetPage() {
  const params = useParams()
  const businessId = params.businessId as string

  if (!businessId) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-xl font-bold text-red-600 mb-2">Invalid Widget</h1>
          <p className="text-gray-600">Business ID is required</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8">
      <div className="container mx-auto px-4">
        <BookingWidget 
          businessId={businessId}
          theme="light"
          primaryColor="#8B5CF6"
        />
      </div>
    </div>
  )
}