import { NextResponse } from 'next/server';
import { auth } from './auth';

export default auth((req) => {
  if (!req.auth) {
    return NextResponse.redirect(new URL('/', req.url));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ['/OngSelector/:path*', '/dashboard/:path*'],
};
