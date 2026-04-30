import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

// Initialize Resend with the API key from your .env file
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();

    // 1. Basic Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { message: "All fields (name, email, password) are required." },
        { status: 400 },
      );
    }

    // 2. Check if the user already exists in the database
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Return 409 Conflict so the frontend can redirect to /login
      return NextResponse.json(
        { message: "An account with this email already exists." },
        { status: 409 },
      );
    }

    // 3. Hash the password for security
    // Salting at 12 rounds is industry standard for banking apps
    const passwordHash = await bcrypt.hash(password, 12);

    // 4. Generate a 6-digit OTP and set 10-minute expiry
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // 5. Create the User record in PostgreSQL via Prisma
    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        otpCode,
        otpExpiry,
        // isVerified defaults to false in our schema
      },
    });

    // 6. Send the Real Email via Resend
    // Note: On the Resend free tier, 'to' must be the email you signed up with.
    try {
      await resend.emails.send({
        from: "OnePot Bank <onboarding@resend.dev>",
        to: email,
        subject: "Verify your OnePot Account",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px;">
            <h2 style="color: #1e3a8a; text-align: center;">Welcome to OnePot Bank</h2>
            <p style="font-size: 16px; color: #475569;">Hello ${name},</p>
            <p style="font-size: 16px; color: #475569;">Please use the following code to verify your account. This code will expire in 10 minutes.</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e3a8a; background: #f1f5f9; padding: 10px 20px; border-radius: 4px;">
                ${otpCode}
              </span>
            </div>
            <p style="font-size: 14px; color: #94a3b8; text-align: center;">If you did not request this, please ignore this email.</p>
          </div>
        `,
      });
    } catch (emailError) {
      // Log the error but don't fail the registration; user can still see OTP in server logs
      console.error("Resend failed to send email:", emailError);
    }

    // Always log the OTP to the console as a backup for your demo
    console.log("-----------------------------------------");
    console.log(`DEBUG: OTP for ${email} is ${otpCode}`);
    console.log("-----------------------------------------");

    return NextResponse.json(
      { message: "User registered successfully. Please check your email." },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration API Error:", error);
    return NextResponse.json(
      { message: "Internal server error during registration." },
      { status: 500 },
    );
  }
}
