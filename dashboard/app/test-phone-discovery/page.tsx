'use client'

import { useState } from 'react'

export default function TestPhoneDiscovery() {
  const [phone, setPhone] = useState('555-123-4567')
  const [results, setResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const testDiscovery = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/test-business-discovery?phone=${encodeURIComponent(phone)}`)
      const data = await response.json()
      setResults(data)
    } catch (error) {
      setResults({ error: 'Failed to test discovery' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test Phone-Based Business Discovery</h1>
      
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex gap-4 items-end mb-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="555-123-4567"
            />
          </div>
          <button
            onClick={testDiscovery}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Test Discovery'}
          </button>
        </div>
      </div>

      {results && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="font-bold mb-4">Results:</h2>
          <pre className="bg-white p-4 rounded border overflow-auto text-sm">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-8 bg-blue-50 p-6 rounded-lg">
        <h2 className="font-bold mb-4">How It Works:</h2>
        <ol className="list-decimal pl-6 space-y-2">
          <li>Customer enters phone number at login</li>
          <li>System looks up phone in customers table</li>
          <li>System finds all business relationships for that customer</li>
          <li>If multiple businesses: show selection screen</li>
          <li>If single business: auto-select and proceed</li>
          <li>If no businesses: show registration error</li>
        </ol>
      </div>

      <div className="mt-6 bg-green-50 p-6 rounded-lg">
        <h2 className="font-bold mb-4">Benefits:</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Reliable:</strong> Phone number is universal customer identifier</li>
          <li><strong>User-Friendly:</strong> Customers only need to remember their phone</li>
          <li><strong>Multi-Business:</strong> Supports customers who visit multiple salons</li>
          <li><strong>Scalable:</strong> Works across entire platform with any number of businesses</li>
          <li><strong>Future-Proof:</strong> Handles business changes, mergers, etc.</li>
        </ul>
      </div>
    </div>
  )
}