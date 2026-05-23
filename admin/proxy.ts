import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/login', '/api/auth/session']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const session = request.cookies.get('session')

  // Zaten giriş yapmışsa login sayfasını atla
  if (pathname === '/login' && session?.value) {
    return NextResponse.redirect(new URL('/dramas', request.url))
  }

  const isPublic =
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')

  if (isPublic) return NextResponse.next()

  if (!session?.value) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}