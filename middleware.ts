import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Cache configuration for static assets
const STATIC_CACHE_CONFIG = {
  // Images
  '\\.(jpg|jpeg|png|gif|webp|svg|ico)$': {
    maxAge: 31536000, // 1 year
    staleWhileRevalidate: 86400, // 1 day
  },
  // Fonts
  '\\.(woff|woff2|eot|ttf|otf)$': {
    maxAge: 31536000, // 1 year
    staleWhileRevalidate: 86400, // 1 day
  },
  // CSS and JS
  '\\.(css|js)$': {
    maxAge: 86400, // 1 day
    staleWhileRevalidate: 3600, // 1 hour
  },
  // JSON and other data files
  '\\.(json|xml)$': {
    maxAge: 3600, // 1 hour
    staleWhileRevalidate: 300, // 5 minutes
  },
}

function addCacheHeaders(response: NextResponse, request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Check if it's a static asset
  for (const [pattern, config] of Object.entries(STATIC_CACHE_CONFIG)) {
    if (new RegExp(pattern).test(pathname)) {
      response.headers.set(
        'Cache-Control',
        `public, max-age=${config.maxAge}, stale-while-revalidate=${config.staleWhileRevalidate}`
      )
      response.headers.set('Vary', 'Accept-Encoding')
      break
    }
  }

  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Add CSP header for enhanced security
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.openai.com https://api.anthropic.com",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')
  
  response.headers.set('Content-Security-Policy', csp)

  return response
}

export default withAuth(
  function middleware(req) {
    const response = NextResponse.next()
    
    // Add cache and security headers
    return addCacheHeaders(response, req)
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Define protected routes
        const protectedPaths = [
          "/dashboard",
          "/projects",
          "/settings",
          "/api/projects",
          "/api/generate",
          "/api/user",
        ]

        const { pathname } = req.nextUrl

        // Check if the current path is protected
        const isProtectedPath = protectedPaths.some(path => 
          pathname.startsWith(path)
        )

        // If it's a protected path, require authentication
        if (isProtectedPath) {
          return !!token
        }

        // Allow access to public paths
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)",
  ],
}