# Microsoft Calendar Integration Setup

This guide will help you set up the Microsoft Calendar integration for the `/calendar` route.

## Prerequisites

1. A Microsoft Azure account
2. Access to Azure Portal

## Step 1: Create Azure App Registration

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Fill in the details:
   - **Name**: `Your App Name`
   - **Supported account types**: `Accounts in any organizational directory and personal Microsoft accounts`
   - **Redirect URI**: `http://localhost:3000/calendar` (for development)
5. Click **Register**

## Step 2: Configure API Permissions

1. In your app registration, go to **API permissions**
2. Click **Add a permission**
3. Select **Microsoft Graph**
4. Choose **Delegated permissions**
5. Add the following permissions:
   - `Calendars.ReadWrite`
   - `User.Read`
6. Click **Add permissions**
7. Click **Grant admin consent** (if you're an admin)

## Step 3: Configure Redirect URIs

1. In your app registration, go to **Authentication**
2. Click **Add a platform**
3. Choose **Web**
4. Add the following redirect URIs:
   - `http://localhost:3000/api/auth/microsoft` (for development)
   - `https://yourdomain.com/api/auth/microsoft` (for production)
5. Click **Configure**

## Step 4: Get Client ID and Secret

1. In your app registration, go to **Overview**
2. Copy the **Application (client) ID**

3. Go to **Certificates & secrets**
4. Click **New client secret**
5. Add a description (e.g., "Development Secret")
6. Choose expiration (recommend 12 months for development)
7. Click **Add**
8. **Important**: Copy the secret value immediately (you won't see it again)

## Step 5: Configure Environment Variables

Create a `.env.local` file in your project root with:

```env
# Azure App Registration (Server-side)
AZURE_CLIENT_ID=your_client_id_here
AZURE_CLIENT_SECRET=your_client_secret_here

# Base URL for redirects
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Important**: You'll need to generate a client secret in your Azure App Registration:
1. Go to your app registration in Azure Portal
2. Navigate to **Certificates & secrets**
3. Click **New client secret**
4. Add a description and choose expiration
5. Copy the generated secret value (you won't see it again)
6. Add it to your `.env.local` file

## Step 6: Test the Integration

1. Start your development server: `pnpm dev`
2. Navigate to `http://localhost:3000/calendar`
3. Click "Sign in with Microsoft"
4. Complete the authentication flow
5. You should see your calendar events displayed

## Features

- **Microsoft Authentication**: Secure OAuth2 flow with Microsoft
- **Calendar Events**: Display your Microsoft calendar events
- **Responsive UI**: Works on desktop and mobile
- **Error Handling**: Proper error messages for failed operations
- **Loading States**: Visual feedback during authentication and data fetching

## Security Notes

- **Server-side token handling**: Access tokens are stored in secure HTTP-only cookies
- **No client-side tokens**: Tokens never exposed to client-side JavaScript
- **Secure cookie settings**: Cookies use httpOnly, secure, and sameSite flags
- **Automatic token refresh**: Server handles token refresh automatically
- **XSS protection**: Tokens cannot be accessed via JavaScript

## Troubleshooting

### Common Issues:

1. **"AADSTS50011: The reply URL specified in the request does not match the reply URLs configured for the application"**
   - Make sure the redirect URI in Azure matches exactly: `http://localhost:3000/calendar`

2. **"AADSTS65001: The user or administrator has not consented to use the application"**
   - Grant admin consent in Azure Portal for the API permissions

3. **"Failed to fetch calendar events"**
   - Check that you have calendar events in your Microsoft account
   - Verify the API permissions are correctly set

### Development vs Production:

For production, you'll need to:
1. Add your production domain to the redirect URIs in Azure
2. Update the `redirectUri` in the MSAL config
3. Consider using environment-specific configurations 