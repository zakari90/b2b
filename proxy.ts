import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Next.js Proxy (formerly Middleware)
 * This runs before every request to your application.
 */
export function proxy(request: NextRequest) {
  // Example: Logging requests
  console.log(`[Proxy] ${request.method} ${request.nextUrl.pathname}`)

  // Example: Adding a custom header to all requests
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-b2b-proxy', 'true')

  // Example: Setting a cookie on the response
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
  
  response.headers.set('x-hello-from-proxy', 'true')
  
  return response
}

// Optionally, specify a matcher to only run on certain paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
