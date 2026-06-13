import { createServerClient } from '@supabase/ssr'
import type { User } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { getLocaleFromLanguage } from '@/lib/i18n'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Without credentials createServerClient throws on construction, which crashes
  // the middleware (MIDDLEWARE_INVOCATION_FAILED) on every request and takes the
  // whole site down. Degrade gracefully: skip session handling and pass through.
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[middleware] Missing Supabase environment variables; skipping session handling')
    return supabaseResponse
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // refreshing the auth token — never let an auth/network error crash middleware
  let user: User | null = null
  try {
    const result = await supabase.auth.getUser()
    user = result.data.user
  } catch (err) {
    console.error('[middleware] supabase.auth.getUser() failed:', err)
  }

  // Define role-based routing
  const url = request.nextUrl.clone()
  
  let cookieChanged = false
  let mappedLocale = 'en'
  let role = 'customer'
  let prefLang: string | null = null
  let prefLangLocale: string | null = null

  if (user) {
    // Authenticated
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, preferred_language')
        .eq('id', user.id)
        .single()

      role = profile?.role || (user.user_metadata?.role as string) || 'customer'
      prefLang = profile?.preferred_language || null
    } catch (err) {
      console.error('[middleware] profile lookup failed:', err)
      role = (user.user_metadata?.role as string) || 'customer'
    }
    if (prefLang) {
      prefLangLocale = getLocaleFromLanguage(prefLang)
    }
  }

  // 1. Read locale cookie
  const currentLocale = request.cookies.get('NEXT_LOCALE')?.value || null

  // 2. Resolve target locale:
  // - If authenticated and profile language is set, sync cookie to profile preference
  // - Otherwise, read cookie, fall back to profile language, fall back to English
  if (user && prefLangLocale) {
    mappedLocale = prefLangLocale
  } else {
    mappedLocale = currentLocale || prefLangLocale || 'en'
  }

  // 7. Add logging temporarily
  console.log(`[i18n-verification-middleware] User ID: ${user ? user.id : 'anonymous'}, Profile Language: "${prefLang || 'undefined'}", Current Locale Code: "${mappedLocale}", Cookie NEXT_LOCALE Value: "${currentLocale || 'undefined'}"`)

  if (currentLocale !== mappedLocale) {
    request.cookies.set('NEXT_LOCALE', mappedLocale)
    cookieChanged = true
    // Re-initialize response with updated request cookies
    supabaseResponse = NextResponse.next({
      request,
    })
  }

  const withLocaleCookie = (res: NextResponse) => {
    if (cookieChanged) {
      res.cookies.set('NEXT_LOCALE', mappedLocale, { path: '/', maxAge: 31536000 })
    }
    return res
  }

  if (!user) {
    const protectedRoutes = ['/account', '/farmer-app', '/orders', '/sell']
    const isProtected = protectedRoutes.some(route => url.pathname.startsWith(route))
    
    if (isProtected && url.pathname !== '/sell') {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/login'
      redirectUrl.searchParams.set('next', url.pathname + url.search)
      return withLocaleCookie(NextResponse.redirect(redirectUrl))
    }
  } else {
    if (url.pathname === '/login') {
      url.pathname = role === 'farmer' ? '/farmer-app' : '/account'
      return withLocaleCookie(NextResponse.redirect(url))
    }
    
    if (role === 'farmer') {
      const customerRoutes = ['/account', '/cart', '/checkout']
      if (customerRoutes.some(route => url.pathname.startsWith(route))) {
        url.pathname = '/farmer-app'
        return withLocaleCookie(NextResponse.redirect(url))
      }
    } else if (role === 'customer') {
      const farmerRoutes = ['/farmer-app']
      if (farmerRoutes.some(route => url.pathname.startsWith(route))) {
        url.pathname = '/account'
        return withLocaleCookie(NextResponse.redirect(url))
      }
    } else if (role === 'admin') {
      if (!url.pathname.startsWith('/admin')) {
        url.pathname = '/admin'
        return withLocaleCookie(NextResponse.redirect(url))
      }
    }
    
    if (cookieChanged) {
      return withLocaleCookie(supabaseResponse)
    }
  }

  return supabaseResponse
}
