'use client'

import { FEATURE_FLAGS, shouldShowReceptionistFeatures } from '@/lib/feature-flags'
import { getAuthenticatedUser } from '@/lib/auth-utils'

export default function MessagesPage() {
  // Check if user should see receptionist features
  const user = getAuthenticatedUser()
  const canViewMessages = shouldShowReceptionistFeatures(user?.businessType)

  if (!canViewMessages) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💬</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Messages</h2>
          <p className="text-gray-600 max-w-md mx-auto">
            This feature is available for general business accounts. 
            Contact support to upgrade your account and access message management.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
        <p className="text-gray-600">Centralized message management</p>
      </div>

      {/* Coming Soon */}
      <div className="text-center py-16 bg-white rounded-lg shadow">
        <div className="text-6xl mb-4">💬</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Messages Center</h3>
        <p className="text-gray-600 max-w-md mx-auto mb-6">
          A unified inbox for all your business communications is coming soon. 
          This will include SMS messages, email responses, and chat conversations.
        </p>
        
        <div className="bg-blue-50 rounded-lg p-6 max-w-lg mx-auto">
          <h4 className="font-semibold text-blue-900 mb-2">Planned Features:</h4>
          <ul className="text-left text-sm text-blue-800 space-y-2">
            <li className="flex items-center">
              <span className="mr-2">📧</span>
              Unified inbox for all communications
            </li>
            <li className="flex items-center">
              <span className="mr-2">📱</span>
              SMS message threading and responses
            </li>
            <li className="flex items-center">
              <span className="mr-2">🤖</span>
              Maya-assisted message drafting
            </li>
            <li className="flex items-center">
              <span className="mr-2">📋</span>
              Message templates and quick replies
            </li>
            <li className="flex items-center">
              <span className="mr-2">🏷️</span>
              Message categorization and tagging
            </li>
            <li className="flex items-center">
              <span className="mr-2">📊</span>
              Response time tracking and analytics
            </li>
          </ul>
        </div>
        
        <div className="mt-6">
          <p className="text-sm text-gray-500">
            For now, check your <strong>Call Log</strong> for Maya's handled conversations
          </p>
        </div>
      </div>
    </div>
  )
}