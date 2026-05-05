import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { email, otp } = await req.json();

  if (!email || !otp) {
    return NextResponse.json(
      { message: "Email and OTP are required." },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.otpCode || !user.otpExpiry) {
    return NextResponse.json(
      { message: "Invalid or expired verification code." },
      { status: 401 },
    );
  }

  if (new Date() > user.otpExpiry) {
    return NextResponse.json(
      { message: "Verification code has expired. Please sign in again." },
      { status: 401 },
    );
  }

  if (user.otpCode !== otp.toString()) {
    return NextResponse.json(
      { message: "Invalid verification code." },
      { status: 401 },
    );
  }

  await prisma.user.update({
    where: { email },
    data: { otpCode: null, otpExpiry: null },
  });

  console.log(`\n[DEV] OTP verified for ${email}\n`);

  const response = NextResponse.json(
    { message: "Authentication successful." },
    { status: 200 },
  );

  response.cookies.set("session_user_id", user.id.toString(), {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24,
    sameSite: "lax",
  });

  return response;
}
