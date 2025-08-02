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
        const response = await fetch('https://graph.microsoft.com/v1.0/me/calendar/getSchedule', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                schedules: ["bluicien@yahoo.co.nz"], // or userPrincipalName
                startTime: {
                    dateTime: "2025-08-02T09:00:00",
                    timeZone: "New Zealand Standard Time"
                },
                endTime: {
                    dateTime: "2025-08-03T17:30:00",
                    timeZone: "New Zealand Standard Time"
                },
                availabilityViewInterval: 30
            })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch availability')
        }

        const data = await response.json()

        return NextResponse.json({ 
            availability: data.value[0].availabilityView || [],
            startTime: "2025-08-02T09:00:00"
        })
        
    } catch (error) {
        console.error('Availability fetch error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch availability' },
            { status: 500 }
        )
    }
}