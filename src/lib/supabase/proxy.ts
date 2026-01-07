// lib/supabase/proxy.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasEnvVars } from "../utils";

// 🔥 Add your protected paths logic here
const rawProtected = process.env.NEXT_PUBLIC_PROTECTED_PATHS || '/protected'
const PROTECTED_PREFIXES = rawProtected
  .split(',')
  .map((p) => p.trim().replace(/\/$/, ''))
  .filter(Boolean)

const isProtectedPath = (pathname: string) =>
  PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  if (!hasEnvVars) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  // 🔥 REPLACE THE OLD LOGIC WITH YOUR PROTECTED PATH CHECK
  const pathname = request.nextUrl.pathname;

  // Skip auth routes to avoid redirect loops
  if (pathname.startsWith("/auth")) {
    return supabaseResponse;
  }

  // 🎯 Only protect paths that are in your PROTECTED_PREFIXES
  if (!user && isProtectedPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}