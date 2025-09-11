'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { FEATURE_FLAGS, shouldShowReceptionistFeatures } from '@/lib/feature-flags'
import { getAuthenticatedUser } from '@/lib/auth-utils'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface CallLog {
  id: string
  caller_name?: string
  caller_phone?: string
  caller_email?: string
  caller_company?: string
  call_type: string
  message: string
  urgency: string
  status: string
  assigned_to?: string
  follow_up_required: boolean
  follow_up_date?: string
  maya_call_id?: string
  call_duration: number
  created_at: string
  updated_at: string
}

export default function CallLogPage() {
  const [calls, setCalls] = useState<CallLog[]>([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check if user should see receptionist features
  const user = getAuthenticatedUser()
  const canViewCallLogs = FEATURE_FLAGS.callLogs && shouldShowReceptionistFeatures(user?.businessType)

  useEffect(() => {
    if (canViewCallLogs) {
      loadCalls()
    } else {
      setLoading(false)
    }
  }, [filter, canViewCallLogs])

  const loadCalls = async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('call_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (filter === 'new') {
        query = query.eq('status', 'new')
      } else if (filter === 'urgent') {
        query = query.eq('urgency', 'urgent')
      } else if (filter === 'follow_up') {
        query = query.eq('follow_up_required', true)
      }

      const { data, error } = await query
      
      if (error) throw error
      
      setCalls(data || [])
    } catch (err) {
      console.error('Error loading calls:', err)
      setError(err instanceof Error ? err.message : 'Failed to load calls')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (callId: string) => {
    try {
      const { error } = await supabase
        .from('call_logs')
        .update({ 
          status: 'read',
          updated_at: new Date().toISOString()
        })
        .eq('id', callId)

      if (error) throw error
      
      // Update local state
      setCalls(prev => prev.map(call => 
        call.id === callId ? { ...call, status: 'read' } : call
      ))
    } catch (err) {
      console.error('Error marking as read:', err)
      setError(err instanceof Error ? err.message : 'Failed to update call')
    }
  }

  const markAsResolved = async (callId: string) => {
    try {
      const { error } = await supabase
        .from('call_logs')
        .update({ 
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', callId)

      if (error) throw error
      
      // Update local state
      setCalls(prev => prev.map(call => 
        call.id === callId ? { ...call, status: 'resolved' } : call
      ))
    } catch (err) {
      console.error('Error marking as resolved:', err)
      setError(err instanceof Error ? err.message : 'Failed to update call')
    }
  }

  const assignCall = async (callId: string, assignee: string) => {
    try {
      const { error } = await supabase
        .from('call_logs')
        .update({ 
          assigned_to: assignee,
          assigned_at: new Date().toISOString(),
          status: 'in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', callId)

      if (error) throw error
      
      // Update local state
      setCalls(prev => prev.map(call => 
        call.id === callId ? { ...call, assigned_to: assignee, status: 'in_progress' } : call
      ))
    } catch (err) {
      console.error('Error assigning call:', err)
      setError(err instanceof Error ? err.message : 'Failed to assign call')
    }
  }

  if (!canViewCallLogs) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📞</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Call Log Feature</h2>
          <p className="text-gray-600 max-w-md mx-auto">
            This feature is available for general business accounts. 
            Contact support to upgrade your account and access call logging capabilities.
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Call Log</h1>
        <p className="text-gray-600">All calls handled by Maya</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="text-red-400">⚠️</div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-2xl mr-3">📞</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Calls</p>
              <p className="text-2xl font-bold text-gray-900">{calls.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-2xl mr-3">🆕</div>
            <div>
              <p className="text-sm font-medium text-gray-600">New</p>
              <p className="text-2xl font-bold text-blue-600">{calls.filter(c => c.status === 'new').length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-2xl mr-3">🚨</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Urgent</p>
              <p className="text-2xl font-bold text-red-600">{calls.filter(c => c.urgency === 'urgent').length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-2xl mr-3">📋</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Follow-up</p>
              <p className="text-2xl font-bold text-orange-600">{calls.filter(c => c.follow_up_required).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { key: 'all', label: 'All Calls', count: calls.length },
          { key: 'new', label: 'New', count: calls.filter(c => c.status === 'new').length },
          { key: 'urgent', label: 'Urgent', count: calls.filter(c => c.urgency === 'urgent').length },
          { key: 'follow_up', label: 'Follow-up', count: calls.filter(c => c.follow_up_required).length }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded text-sm font-medium ${
              filter === tab.key
                ? 'bg-white text-blue-600 shadow'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.label} {tab.count > 0 && `(${tab.count})`}
          </button>
        ))}
      </div>

      {/* Call List */}
      {calls.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="text-6xl mb-4">📞</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No calls yet</h3>
          <p className="text-gray-600">When Maya answers calls, they'll appear here</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {calls.map((call) => (
            <div key={call.id} className="border-b border-gray-200 p-6 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-lg text-gray-900">
                      {call.caller_name || 'Unknown Caller'}
                    </h3>
                    
                    {/* Status Badge */}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      call.status === 'new' ? 'bg-blue-100 text-blue-800' :
                      call.status === 'urgent' ? 'bg-red-100 text-red-800' :
                      call.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {call.status.toUpperCase()}
                    </span>

                    {/* Urgency Badge */}
                    {call.urgency === 'urgent' && (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                        🚨 URGENT
                      </span>
                    )}

                    {/* Call Type */}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      call.call_type === 'sales' ? 'bg-green-100 text-green-800' :
                      call.call_type === 'support' ? 'bg-yellow-100 text-yellow-800' :
                      call.call_type === 'appointment' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {call.call_type.toUpperCase()}
                    </span>
                  </div>

                  {/* Contact Info */}
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    {call.caller_phone && (
                      <span className="flex items-center">
                        <span className="mr-1">📱</span>
                        {call.caller_phone}
                      </span>
                    )}
                    {call.caller_email && (
                      <span className="flex items-center">
                        <span className="mr-1">✉️</span>
                        {call.caller_email}
                      </span>
                    )}
                    {call.caller_company && (
                      <span className="flex items-center">
                        <span className="mr-1">🏢</span>
                        {call.caller_company}
                      </span>
                    )}
                  </div>

                  {/* Message */}
                  <p className="text-gray-700 mb-3">{call.message}</p>

                  {/* Call Details */}
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>
                      📞 {Math.floor(call.call_duration / 60)}:{(call.call_duration % 60).toString().padStart(2, '0')}
                    </span>
                    <span>
                      🕐 {new Date(call.created_at).toLocaleString()}
                    </span>
                    {call.assigned_to && (
                      <span>
                        👤 Assigned to {call.assigned_to}
                      </span>
                    )}
                  </div>

                  {/* Follow-up indicator */}
                  {call.follow_up_required && (
                    <div className="mt-2 flex items-center text-sm text-orange-600">
                      <span className="mr-1">📅</span>
                      Follow-up required
                      {call.follow_up_date && ` by ${new Date(call.follow_up_date).toLocaleDateString()}`}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-2 ml-4">
                  {call.status === 'new' && (
                    <button
                      onClick={() => markAsRead(call.id)}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
                    >
                      Mark Read
                    </button>
                  )}
                  
                  {call.status !== 'resolved' && (
                    <button
                      onClick={() => markAsResolved(call.id)}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm"
                    >
                      Resolve
                    </button>
                  )}

                  <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm">
                    Call Back
                  </button>

                  {!call.assigned_to && (
                    <button
                      onClick={() => assignCall(call.id, user?.email || 'Assigned')}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 text-sm"
                    >
                      Assign to Me
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}