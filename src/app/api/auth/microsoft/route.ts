import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Validate environment variables
if (!process.env.AZURE_CLIENT_ID) {
  throw new Error('AZURE_CLIENT_ID environment variable is not set')
}

if (!process.env.AZURE_CLIENT_SECRET) {
  throw new Error('AZURE_CLIENT_SECRET environment variable is not set')
}

if (!process.env.NEXT_PUBLIC_BASE_URL) {
  throw new Error('NEXT_PUBLIC_BASE_URL environment variable is not set')
}

// PKCE helper functions
function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString('base64url')
}

function generateCodeChallenge(verifier: string): string {
  return crypto.createHash('sha256').update(verifier).digest('base64url')
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  // Handle errors from Microsoft
  if (error) {
    console.error('Microsoft auth error:', error, searchParams.get('error_description'))
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/calendar?error=${error}`)
  }

  if (!code) {
    // Generate PKCE values
    const codeVerifier = generateCodeVerifier()
    const codeChallenge = generateCodeChallenge(codeVerifier)
    
    // Generate auth URL for initial redirect with PKCE
    const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
      `client_id=${process.env.AZURE_CLIENT_ID}` +
      `&response_type=code` +
      `&redirect_uri=${encodeURIComponent(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/microsoft`)}` +
      `&scope=${encodeURIComponent('User.Read Schedule.Read.All MailboxSettings.Read Calendars.ReadWrite Calendars.Read.Shared')}` +
      `&state=some-state-value` +
      `&code_challenge=${codeChallenge}` +
      `&code_challenge_method=S256`

    // Store code verifier in a secure cookie for later use
    const response = NextResponse.redirect(authUrl)
    response.cookies.set('pkce_verifier', codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600 // 10 minutes
    })

    return response
  }

  try {
    // Get the code verifier from the cookie
    const codeVerifier = request.cookies.get('pkce_verifier')?.value
    
    if (!codeVerifier) {
      throw new Error('PKCE code verifier not found')
    }

    // Exchange code for tokens using direct HTTP request with PKCE (confidential client)
    const tokenRequestBody = new URLSearchParams({
      client_id: process.env.AZURE_CLIENT_ID!,
      client_secret: process.env.AZURE_CLIENT_SECRET!,
      code: code,
      redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/microsoft`,
      grant_type: 'authorization_code',
      scope: 'Calendars.ReadWrite.Shared User.Read',
      code_verifier: codeVerifier
    })

    console.log('Token exchange request (confidential client):', {
      client_id: process.env.AZURE_CLIENT_ID,
      redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/microsoft`,
      scope: 'Calendars.ReadWrite.Shared User.Read',
      code_verifier_length: codeVerifier.length
    })

    const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenRequestBody
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('Token exchange failed:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        errorData: errorData,
        url: tokenResponse.url
      })
      throw new Error(`Failed to exchange code for token: ${tokenResponse.status} ${errorData}`)
    }

    const tokenData = await tokenResponse.json()

    // Set secure HTTP-only cookies with tokens
    const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/calendar`)
    
    response.cookies.set('msal_access_token', tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600 // 1 hour
    })

    // Note: We don't have user info from this flow, so we'll set it later
    response.cookies.set('msal_user_info', JSON.stringify({
      name: 'User',
      username: 'user@example.com'
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600 // 1 hour
    })

    // Clear the PKCE verifier cookie
    response.cookies.set('pkce_verifier', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0 // Expire immediately
    })

    return response
  } catch (error) {
    console.error('Token exchange error:', error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/calendar?error=auth_failed`)
  }
} 