import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ message: "Email is required." }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });

  // Always return 200 so we don't reveal whether an email is registered
  if (!user) return NextResponse.json({ message: "If that email is registered you'll receive a reset code." });

  const otpCode  = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 min for resets

  await prisma.user.update({ where: { id: user.id }, data: { otpCode, otpExpiry } });

  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "OnePot Bank <onboarding@resend.dev>",
        to: email,
        subject: "Reset your OnePot password",
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;border:1px solid #e2e8f0;border-radius:12px;">
            <h2 style="color:#1a6e3f;text-align:center;">OnePot</h2>
            <p style="color:#475569;">Hi ${user.name}, use this code to reset your password:</p>
            <div style="text-align:center;margin:28px 0;">
              <span style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#0d3d22;background:#f0fdf4;padding:12px 24px;border-radius:8px;">${otpCode}</span>
            </div>
            <p style="font-size:13px;color:#94a3b8;text-align:center;">Expires in 30 minutes. If you didn't request this, you can safely ignore it.</p>
          </div>
        `,
      });
    } catch (e) {
      console.error("Resend error:", e);
    }
  }

  console.log(`[PASSWORD RESET OTP] ${email}: ${otpCode}`);

  return NextResponse.json({
    message: "If that email is registered you'll receive a reset code.",
    dev_otp: otpCode,
  });
}
