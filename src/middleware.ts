// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Start with a basic NextResponse
  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Read cookies from the incoming request
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        // Write cookies to the response ONLY (never to the request)
        set(name: string, value: string, options?: Parameters<typeof response.cookies.set>[2]) {
          response.cookies.set(name, value, options)
        },
        // Optional, but nice to implement for completeness
        remove(name: string, options?: Parameters<typeof response.cookies.set>[2]) {
          response.cookies.set(name, '', { ...options, maxAge: 0 })
        },
      },
    }
  )

  // This will refresh the session if expired, and may set auth cookies on `response`
  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
