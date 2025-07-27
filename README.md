# Supabase Auth Demo

A Next.js application with Supabase authentication built using TypeScript and Tailwind CSS.

## Features

- 🔐 User authentication (sign up, sign in, sign out)
- 👤 User profile display
- 🎨 Modern UI with Tailwind CSS
- 📱 Responsive design
- 🔒 Secure authentication with Supabase

## Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- A Supabase project

## Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd practice-supabase
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to your project dashboard
   - Navigate to Settings > API
   - Copy your project URL and anon key

4. **Set up environment variables**
   - Copy `.env.local.example` to `.env.local` (if it exists)
   - Update `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with AuthProvider
│   ├── page.tsx            # Main page with auth interface
│   └── globals.css         # Global styles
├── components/
│   └── auth/
│       ├── AuthForm.tsx    # Login/signup form
│       ├── AuthProvider.tsx # Auth context provider
│       └── UserProfile.tsx # User profile component
└── lib/
    └── supabase.ts         # Supabase client configuration
```

## Usage

1. **Sign Up**: Click "Don't have an account? Sign Up" and enter your email and password
2. **Sign In**: Enter your credentials to sign in
3. **View Profile**: Once signed in, you'll see your user profile with sign out option

## Security Notes

- Environment variables are prefixed with `NEXT_PUBLIC_` for client-side access
- The anon key is safe to expose to the client as it has limited permissions
- Always use HTTPS in production
- Consider implementing additional security measures like rate limiting

## Performance Improvements

- The app uses React 19 with concurrent features
- Authentication state is managed efficiently with context
- Components are optimized with proper loading states

## Potential Security Issues & Solutions

1. **Rate Limiting**: Consider implementing rate limiting for auth endpoints
2. **Password Strength**: Add client-side password validation
3. **Email Verification**: Enable email verification in Supabase settings
4. **Session Management**: Implement proper session timeout handling
5. **CORS**: Configure CORS settings in Supabase for production

## Technologies Used

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Supabase** - Backend and authentication
- **pnpm** - Package manager

## License

MIT
