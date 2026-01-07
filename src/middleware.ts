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

  // Skip if path is not protected
  if (!isProtectedPath(pathname)) {
    return NextResponse.next()
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If no user and trying to access a protected route, redirect to login
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
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
    '/((?!api|_next/static|_next/image|favicon.ico|auth).*)',
  ],
}


