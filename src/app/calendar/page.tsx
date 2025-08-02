'use client'

import { useState, useEffect } from 'react'

interface User {
  name?: string
  username?: string
  homeAccountId?: string
}

interface CalendarEvent {
  subject: string
  start: { dateTime: string }
  end: { dateTime: string }
  bodyPreview?: string
}

export default function CalendarPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [availability, setAvailability] = useState<any[]>([])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is authenticated by trying to fetch calendar events
        const response = await fetch('/api/calendar')
        if (response.ok) {
          setIsAuthenticated(true)
          // Get user info from cookie (this would need to be passed from server)
          // For now, we'll set a generic user
          setUser({ name: 'User', username: 'user@example.com' })
          const data = await response.json()
          setCalendarEvents(data.events || [])
        }
      } catch (err) {
        console.error('Auth check error:', err)
      }
    }
    checkAuth()
  }, [])

  const handleLogin = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Redirect to server-side auth endpoint
      window.location.href = '/api/auth/microsoft'
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'Failed to authenticate with Microsoft')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/auth/logout', {
        method: 'POST'
      })
      
      if (response.ok) {
        setIsAuthenticated(false)
        setUser(null)
        setCalendarEvents([])
      }
    } catch (err: any) {
      console.error('Logout error:', err)
      setError(err.message || 'Failed to logout')
    } finally {
      setLoading(false)
    }
  }

  const fetchCalendarEvents = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/calendar')
      
      if (!response.ok) {
        if (response.status === 401) {
          setIsAuthenticated(false)
          setUser(null)
          return
        }
        throw new Error('Failed to fetch calendar events')
      }

      const data = await response.json()
      setCalendarEvents(data.events || [])
    } catch (err: any) {
      console.error('Fetch calendar error:', err)
      setError(err.message || 'Failed to fetch calendar events')
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailability = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/calendar/availability')
      if (!response.ok) {
        throw new Error('Failed to fetch availability')
      }

      const data = await response.json()
      console.log(data)
      // setAvailability(data.availability || [])
      const availabilityView = parseAvailabilityView(data.availability, data.startTime)
      console.log(availabilityView)

    } catch (err: any) {
      console.error('Fetch availability error:', err)
      setError(err.message || 'Failed to fetch availability')
    } finally {
      setLoading(false)
    }
  }

  function parseAvailabilityView(view: string, startTimeUTC: string) {
    const blocks = [];
    const startTime = new Date(startTimeUTC);
    for (let i = 0; i < view.length; i++) {
      const slotTime = new Date(startTime.getTime() + i * 30 * 60 * 1000); // add 30 min per block
      blocks.push({
        time: slotTime.toLocaleString('en-NZ', { timeZone: 'Pacific/Auckland' }),
        status: view[i] === '1' ? 'Busy' : 'Free'
      });
    }
    return blocks;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Microsoft Calendar Integration
          </h1>
          <p className="mt-2 text-gray-600">
            Connect your Microsoft account to view your calendar events
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-6">
          {!isAuthenticated ? (
            <div className="text-center">
              <p className="text-gray-600 mb-6">
                Sign in with your Microsoft account to access your calendar
              </p>
              <button
                onClick={handleLogin}
                disabled={loading}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign in with Microsoft'}
              </button>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Welcome, {user?.name || user?.username || 'User'}!
                  </h2>
                  <p className="text-gray-600">
                    Your calendar events are displayed below
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Sign Out
                </button>
              </div>

              <div className="mb-6">
                <button
                  onClick={fetchCalendarEvents}
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Refresh Calendar'}
                </button>
              </div>

              {calendarEvents.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Your Calendar Events
                  </h3>
                  <div className="grid gap-4">
                    {calendarEvents.map((event, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900">
                          {event.subject}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(event.start.dateTime).toLocaleString()} - {new Date(event.end.dateTime).toLocaleString()}
                        </p>
                        {event.bodyPreview && (
                          <p className="text-sm text-gray-500 mt-2">
                            {event.bodyPreview}
                          </p>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={fetchAvailability}
                      disabled={loading}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {loading ? 'Loading...' : 'Refresh Availability'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    {loading ? 'Loading calendar events...' : 'No calendar events found. Click "Refresh Calendar" to load your events.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 