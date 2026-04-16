// This handles POST /api/auth/verify-otp — step 2 of the login flow.
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
// This endpoint verifies the OTP sent to the user's email. If valid,
//  it clears the OTP and sets a session cookie.
export async function POST(req: NextRequest) {
  const { email, otp } = await req.json();
// checks if email and otp are provided in the request body
  if (!email || !otp) {
    return NextResponse.json(
      { message: "Email and OTP are required." },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });
// checks if user exists and has an OTP set
  if (!user || !user.otpCode || !user.otpExpiry) { 
    return NextResponse.json(
      { message: "Invalid or expired verification code." },
      { status: 401 }
    );
  }
// checks if OTP has expired
  if (new Date() > user.otpExpiry) {
    return NextResponse.json(
      { message: "Verification code has expired. Please sign in again." },
      { status: 401 }
    );
  }
// checks if OTP matches the one stored in the database
  if (user.otpCode !== otp.toString()) {
    return NextResponse.json(
      { message: "Invalid verification code." },
      { status: 401 }
    );
  }

  // Clear OTP after successful verification
  await prisma.user.update({
    where: { email },
    data: { otpCode: null, otpExpiry: null },
  });
// In production: send OTP via email. For now it prints to the dev console.
  console.log(`\n[DEV] OTP verified for ${email}\n`);
  const response = NextResponse.json(
    { message: "Authentication successful." },
    { status: 200 }
  );

  // Set a simple session cookie (HTTP-only) called session_user_id. means javascript in the
  // browser cant read it protecting it aginst XSS attacks. last 24 hours
  response.cookies.set("session_user_id", user.id.toString(), {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
    sameSite: "lax",
  });

  return response;
}
