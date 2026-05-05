import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { email, otp, newPassword } = await req.json();

  if (!email || !otp || !newPassword) {
    return NextResponse.json({ message: "Email, code, and new password are required." }, { status: 400 });
  }

  if (newPassword.length < 8 || !/\d/.test(newPassword) || !/[A-Z]/.test(newPassword)) {
    return NextResponse.json({ message: "Password must be at least 8 characters, include a number and an uppercase letter." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!user || !user.otpCode || !user.otpExpiry) {
    return NextResponse.json({ message: "Invalid or expired reset code." }, { status: 400 });
  }
  if (user.otpCode !== otp.trim() || new Date() > user.otpExpiry) {
    return NextResponse.json({ message: "Invalid or expired reset code." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, otpCode: null, otpExpiry: null },
  });

  return NextResponse.json({ message: "Password updated. You can now log in." });
}
