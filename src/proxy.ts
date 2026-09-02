import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const role = req.auth?.user?.role;
  const isStaff = role === "ADMIN" || role === "STAFF";

  if (!isStaff) {
    const url = new URL("/login", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
});

export const config = {
  matcher: ["/admin/:path*"],
};
