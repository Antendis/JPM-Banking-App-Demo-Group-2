import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendOtpEmail } from "@/lib/email";

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { message: "Email and password are required." },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Use a constant-time check to avoid user enumeration
  if (!user || !user.passwordHash) {
    await bcrypt.hash("dummy", 12); // prevent timing attacks
    return NextResponse.json(
      { message: "Invalid credentials." },
      { status: 401 }
    );
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json(
      { message: "Invalid credentials." },
      { status: 401 }
    );
  }

  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await prisma.user.update({
    where: { email },
    data: { otpCode: otp, otpExpiry },
  });

  await sendOtpEmail(email, otp);

  const body: { message: string; dev_otp?: string } = {
    message: "Verification code sent to your email.",
  };

  // Expose OTP in response body only in development so you can test without email
  if (process.env.NODE_ENV !== "production") {
    body.dev_otp = otp;
  }

  return NextResponse.json(body, { status: 200 });
}
