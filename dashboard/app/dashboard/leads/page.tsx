'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { FEATURE_FLAGS, shouldShowReceptionistFeatures } from '@/lib/feature-flags'
import { getAuthenticatedUser } from '@/lib/auth-utils'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Lead {
  id: string
  name: string
  email?: string
  phone?: string
  company?: string
  job_title?: string
  source: string
  source_details?: string
  status: string
  interest?: string
  budget_range?: string
  timeline?: string
  decision_maker: boolean
  pain_points?: string
  maya_qualified: boolean
  qualification_score?: number
  maya_notes?: string
  assigned_to?: string
  next_follow_up_date?: string
  last_contact_date?: string
  estimated_value?: number
  probability_percentage?: number
  created_at: string
  updated_at: string
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  // Check if user should see lead management features
  const user = getAuthenticatedUser()
  const canViewLeads = FEATURE_FLAGS.leadManagement && shouldShowReceptionistFeatures(user?.businessType)

  useEffect(() => {
    if (canViewLeads) {
      loadLeads()
    } else {
      setLoading(false)
    }
  }, [filter, canViewLeads])

  const loadLeads = async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (filter === 'new') {
        query = query.eq('status', 'new')
      } else if (filter === 'qualified') {
        query = query.eq('maya_qualified', true)
      } else if (filter === 'hot') {
        query = query.gte('qualification_score', 8)
      } else if (filter === 'follow_up') {
        query = query.not('next_follow_up_date', 'is', null)
      }

      const { data, error } = await query
      
      if (error) throw error
      
      setLeads(data || [])
    } catch (err) {
      console.error('Error loading leads:', err)
      setError(err instanceof Error ? err.message : 'Failed to load leads')
    } finally {
      setLoading(false)
    }
  }

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId)

      if (error) throw error
      
      // Update local state
      setLeads(prev => prev.map(lead => 
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      ))
    } catch (err) {
      console.error('Error updating lead status:', err)
      setError(err instanceof Error ? err.message : 'Failed to update lead')
    }
  }

  const assignLead = async (leadId: string, assignee: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ 
          assigned_to: assignee,
          assigned_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId)

      if (error) throw error
      
      // Update local state
      setLeads(prev => prev.map(lead => 
        lead.id === leadId ? { ...lead, assigned_to: assignee } : lead
      ))
    } catch (err) {
      console.error('Error assigning lead:', err)
      setError(err instanceof Error ? err.message : 'Failed to assign lead')
    }
  }

  if (!canViewLeads) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Lead Management</h2>
          <p className="text-gray-600 max-w-md mx-auto">
            This feature is available for general business accounts. 
            Contact support to upgrade your account and access lead management capabilities.
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Lead Management</h1>
        <p className="text-gray-600">Prospects qualified by Maya</p>
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
            <div className="text-2xl mr-3">👥</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Leads</p>
              <p className="text-2xl font-bold text-gray-900">{leads.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-2xl mr-3">✅</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Qualified</p>
              <p className="text-2xl font-bold text-green-600">{leads.filter(l => l.maya_qualified).length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-2xl mr-3">🔥</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Hot Leads</p>
              <p className="text-2xl font-bold text-red-600">{leads.filter(l => (l.qualification_score || 0) >= 8).length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-2xl mr-3">💰</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Estimated Value</p>
              <p className="text-2xl font-bold text-green-600">
                ${leads.reduce((sum, lead) => sum + (lead.estimated_value || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { key: 'all', label: 'All Leads', count: leads.length },
          { key: 'new', label: 'New', count: leads.filter(l => l.status === 'new').length },
          { key: 'qualified', label: 'Qualified', count: leads.filter(l => l.maya_qualified).length },
          { key: 'hot', label: 'Hot', count: leads.filter(l => (l.qualification_score || 0) >= 8).length },
          { key: 'follow_up', label: 'Follow-up', count: leads.filter(l => l.next_follow_up_date).length }
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

      {/* Lead List */}
      {leads.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No leads yet</h3>
          <p className="text-gray-600">When Maya qualifies prospects from calls, they'll appear here</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {leads.map((lead) => (
            <div key={lead.id} className="border-b border-gray-200 p-6 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-lg text-gray-900">
                      {lead.name}
                    </h3>
                    
                    {/* Maya Qualified Badge */}
                    {lead.maya_qualified && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        ✅ Maya Qualified
                      </span>
                    )}

                    {/* Qualification Score */}
                    {lead.qualification_score && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        lead.qualification_score >= 8 ? 'bg-red-100 text-red-800' :
                        lead.qualification_score >= 6 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        Score: {lead.qualification_score}/10
                      </span>
                    )}

                    {/* Status Badge */}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      lead.status === 'new' ? 'bg-blue-100 text-blue-800' :
                      lead.status === 'qualified' ? 'bg-green-100 text-green-800' :
                      lead.status === 'won' ? 'bg-purple-100 text-purple-800' :
                      lead.status === 'lost' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {lead.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Contact Info */}
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    {lead.phone && (
                      <span className="flex items-center">
                        <span className="mr-1">📱</span>
                        {lead.phone}
                      </span>
                    )}
                    {lead.email && (
                      <span className="flex items-center">
                        <span className="mr-1">✉️</span>
                        {lead.email}
                      </span>
                    )}
                    {lead.company && (
                      <span className="flex items-center">
                        <span className="mr-1">🏢</span>
                        {lead.company}
                      </span>
                    )}
                    {lead.job_title && (
                      <span className="flex items-center">
                        <span className="mr-1">👔</span>
                        {lead.job_title}
                      </span>
                    )}
                  </div>

                  {/* Interest & Budget */}
                  {lead.interest && (
                    <p className="text-gray-700 mb-2">
                      <span className="font-medium">Interest:</span> {lead.interest}
                    </p>
                  )}

                  <div className="flex items-center space-x-6 text-sm text-gray-600 mb-2">
                    {lead.budget_range && (
                      <span>💰 Budget: {lead.budget_range}</span>
                    )}
                    {lead.timeline && (
                      <span>⏰ Timeline: {lead.timeline}</span>
                    )}
                    {lead.decision_maker && (
                      <span className="text-green-600">✅ Decision Maker</span>
                    )}
                  </div>

                  {/* Maya Notes */}
                  {lead.maya_notes && (
                    <div className="bg-blue-50 rounded-lg p-3 mb-3">
                      <p className="text-sm font-medium text-blue-900 mb-1">Maya's Notes:</p>
                      <p className="text-sm text-blue-800">{lead.maya_notes}</p>
                    </div>
                  )}

                  {/* Lead Details */}
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>📅 {new Date(lead.created_at).toLocaleDateString()}</span>
                    <span>📊 Source: {lead.source}</span>
                    {lead.assigned_to && (
                      <span>👤 Assigned to {lead.assigned_to}</span>
                    )}
                    {lead.next_follow_up_date && (
                      <span className="text-orange-600">
                        📅 Follow-up: {new Date(lead.next_follow_up_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-2 ml-4">
                  {lead.status === 'new' && (
                    <select
                      onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded text-sm"
                      defaultValue=""
                    >
                      <option value="" disabled>Update Status</option>
                      <option value="contacted">Contacted</option>
                      <option value="qualified">Qualified</option>
                      <option value="proposal_sent">Proposal Sent</option>
                      <option value="negotiating">Negotiating</option>
                      <option value="won">Won</option>
                      <option value="lost">Lost</option>
                      <option value="nurturing">Nurturing</option>
                    </select>
                  )}

                  <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm">
                    Email
                  </button>

                  <button className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm">
                    Call
                  </button>

                  {!lead.assigned_to && (
                    <button
                      onClick={() => assignLead(lead.id, user?.email || 'Assigned')}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 text-sm"
                    >
                      Assign to Me
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedLead(lead)}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{selectedLead.name}</h2>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Contact Information */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Contact Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>Phone: {selectedLead.phone || 'Not provided'}</div>
                    <div>Email: {selectedLead.email || 'Not provided'}</div>
                    <div>Company: {selectedLead.company || 'Not provided'}</div>
                    <div>Job Title: {selectedLead.job_title || 'Not provided'}</div>
                  </div>
                </div>

                {/* Lead Details */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Lead Details</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Interest:</strong> {selectedLead.interest || 'Not specified'}</div>
                    <div><strong>Budget Range:</strong> {selectedLead.budget_range || 'Not specified'}</div>
                    <div><strong>Timeline:</strong> {selectedLead.timeline || 'Not specified'}</div>
                    <div><strong>Decision Maker:</strong> {selectedLead.decision_maker ? 'Yes' : 'No'}</div>
                    <div><strong>Source:</strong> {selectedLead.source}</div>
                    {selectedLead.source_details && (
                      <div><strong>Source Details:</strong> {selectedLead.source_details}</div>
                    )}
                  </div>
                </div>

                {/* Pain Points */}
                {selectedLead.pain_points && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Pain Points</h3>
                    <p className="text-sm text-gray-700">{selectedLead.pain_points}</p>
                  </div>
                )}

                {/* Maya's Assessment */}
                {selectedLead.maya_qualified && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <h3 className="font-semibold text-green-900 mb-2">Maya's Assessment</h3>
                    <div className="space-y-2 text-sm">
                      <div><strong>Qualified:</strong> Yes</div>
                      {selectedLead.qualification_score && (
                        <div><strong>Score:</strong> {selectedLead.qualification_score}/10</div>
                      )}
                      {selectedLead.maya_notes && (
                        <div><strong>Notes:</strong> {selectedLead.maya_notes}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}