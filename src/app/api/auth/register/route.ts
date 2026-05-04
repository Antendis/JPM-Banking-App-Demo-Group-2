import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { message: "All fields (name, email, password) are required." },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { message: "An account with this email already exists." },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const otpCode      = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry    = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.create({
      data: { name, email, passwordHash, otpCode, otpExpiry },
    });

    // Send email only if a Resend API key is configured
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: "OnePot Bank <onboarding@resend.dev>",
          to: email,
          subject: "Your OnePot verification code",
          html: `
            <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;border:1px solid #e2e8f0;border-radius:12px;">
              <h2 style="color:#1a6e3f;text-align:center;margin-bottom:8px;">OnePot</h2>
              <p style="color:#475569;">Hi ${name}, your verification code is:</p>
              <div style="text-align:center;margin:28px 0;">
                <span style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#0d3d22;background:#f0fdf4;padding:12px 24px;border-radius:8px;">${otpCode}</span>
              </div>
              <p style="font-size:13px;color:#94a3b8;text-align:center;">Expires in 10 minutes. If you didn't request this, ignore this email.</p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Resend error:", emailError);
      }
    }

    console.log(`[OTP] ${email}: ${otpCode}`);

    return NextResponse.json(
      { message: "Account created. Check your email for the verification code.", dev_otp: otpCode },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Internal server error during registration." },
      { status: 500 },
    );
  }
}
