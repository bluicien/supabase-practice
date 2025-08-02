import { NextResponse } from 'next/server'

export async function GET() {
  const envCheck = {
    AZURE_CLIENT_ID: process.env.AZURE_CLIENT_ID ? 'Set' : 'Not Set',
    AZURE_CLIENT_SECRET: process.env.AZURE_CLIENT_SECRET ? 'Set' : 'Not Set',
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'Not Set',
    NODE_ENV: process.env.NODE_ENV || 'Not Set'
  }

  // Test the auth URL generation
  const testAuthUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
    `client_id=${process.env.AZURE_CLIENT_ID || 'MISSING'}` +
    `&response_type=code` +
    `&redirect_uri=${encodeURIComponent(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/microsoft`)}` +
    `&scope=${encodeURIComponent('Calendars.ReadWrite.Shared User.Read')}` +
    `&state=test-state`

  return NextResponse.json({
    message: 'Authentication Debug Info',
    environment: envCheck,
    testAuthUrl: testAuthUrl,
    redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/microsoft`,
    timestamp: new Date().toISOString()
  })
} 