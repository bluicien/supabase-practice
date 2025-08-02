import { NextResponse } from 'next/server'

export async function GET() {
  const envVars = {
    AZURE_CLIENT_ID: process.env.AZURE_CLIENT_ID ? 'Set' : 'Not Set',
    AZURE_CLIENT_SECRET: process.env.AZURE_CLIENT_SECRET ? 'Set' : 'Not Set',
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL ? 'Set' : 'Not Set',
    NODE_ENV: process.env.NODE_ENV || 'Not Set'
  }

  return NextResponse.json({
    message: 'Environment Variables Check',
    environment: envVars,
    timestamp: new Date().toISOString()
  })
} 