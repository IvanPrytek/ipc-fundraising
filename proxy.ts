import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only run on portal routes
  if (!pathname.startsWith("/portal")) {
    return NextResponse.next();
  }

  // Public portal routes — no auth needed
  if (
    pathname === "/portal/login" ||
    pathname.startsWith("/portal/login/")
  ) {
    return NextResponse.next();
  }

  // Create Supabase client with cookie forwarding
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session (important for token refresh)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Not authenticated — redirect to login
  if (!user) {
    const loginUrl = new URL("/portal/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user visiting /portal exactly — redirect to chooser
  if (pathname === "/portal" || pathname === "/portal/") {
    return NextResponse.redirect(new URL("/portal/choose", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/portal/:path*"],
};
