import { updateSession } from '@/lib/supabase/proxy'
import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

const rawProtected = process.env.NEXT_PUBLIC_PROTECTED_PATHS || '/protected'
const PROTECTED_PREFIXES = rawProtected
  .split(',')
  .map((p) => p.trim().replace(/\/$/, ''))
  .filter(Boolean)

const isProtectedPath = (pathname: string) =>
  PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Skip auth routes to avoid redirect loops
  if (pathname.startsWith('/auth')) {
    return NextResponse.next()
  }

  // Update session using the proxy pattern
  let response = await updateSession(request)

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser()

  //Add userId to header in case needed
  const requestHeaders = new Headers(request.headers)
  if (user) {
    requestHeaders.set('x-user-id', user.id)
    response.headers.set('x-user-id', user.id)
  }

  // Skip if path is not protected
  if (!isProtectedPath(pathname)) {
    return NextResponse.next({
      request: {
        headers: requestHeaders
      }
    })
  }

  // If no user and trying to access a protected route, redirect to login
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders
    }
  })
}

export const config = {
  // Match all routes except static files, API routes, and auth routes
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth (auth routes to avoid redirect loops)
     */
    '/((?!_next/static|_next/image|favicon.ico|auth).*)',
  ],
}


