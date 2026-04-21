import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOtpEmail(to: string, code: string): Promise<void> {
  await resend.emails.send({
    from: "noreply@greenbank.demo",
    to: [to],
    subject: "Your GreenBank login code",
    text: `Your GreenBank verification code is: ${code}\n\nThis code expires in 10 minutes. If you didn't request this, you can safely ignore this email.`,
  });
}
