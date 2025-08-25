'use client'

import { 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'

const testData = [
  { month: 'Jan', revenue: 1000, appointments: 10 },
  { month: 'Feb', revenue: 1200, appointments: 12 }
]

export default function TestChartsPage() {
  return (
    <div className="p-8">
      <h1>Chart Test Page</h1>
      
      <div className="bg-white p-4 mt-4 border rounded">
        <h2>Simple Bar Chart Test</h2>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <ComposedChart data={testData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="appointments" fill="#8884d8" />
              <Line type="monotone" dataKey="revenue" stroke="#82ca9d" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}