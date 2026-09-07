import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  // Rotas públicas sob /events/invite são acessíveis por participantes sem autenticação
  if (req.nextUrl.pathname.startsWith("/events/invite")) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/OngSelector/:path*",
    "/dashboard/:path*",
    "/kanban/:path*",
    "/bill/:path*",
    "/members/:path*",
    "/profile/:path*",
    "/events/:path*",
  ],
};

