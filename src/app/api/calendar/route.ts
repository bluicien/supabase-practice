import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    try {
        // Get access token from secure cookie
        const accessToken = request.cookies.get('msal_access_token')?.value
        
        if (!accessToken) {
            return NextResponse.json({ error: 'No access token found' }, { status: 401 })
        }

        // Fetch calendar events from Microsoft Graph API
        // Using shared calendars endpoint since we have Calendars.ReadWrite.Shared permission
        const response = await fetch('https://graph.microsoft.com/v1.0/me/calendar/events', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) {
        throw new Error(`Graph API error: ${response.status}`)
        }

        const data = await response.json()
        return NextResponse.json({ events: data.value || [] })

    } catch (error) {
        console.error('Calendar fetch error:', error)
        return NextResponse.json(
        { error: 'Failed to fetch calendar events' }, 
        { status: 500 }
        )
    }
} 