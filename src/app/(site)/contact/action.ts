"use server";

import { z } from "zod";

const schema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  message: z.string().min(10).max(10000),
});

interface FormState {
  success: boolean;
  message: string;
}

export async function sendMessage(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { success: false, message: "Please check your input and try again." };
  }

  // TODO: Wire up email delivery.
  // Option 1 — Resend (https://resend.com, free tier):
  //   import { Resend } from "resend";
  //   const resend = new Resend(process.env.RESEND_API_KEY);
  //   await resend.emails.send({
  //     from: "portfolio@yourdomain.com",
  //     to: "your@email.com",
  //     subject: `Portfolio message from ${parsed.data.name}`,
  //     text: `From: ${parsed.data.name} (${parsed.data.email})\n\n${parsed.data.message}`,
  //   });
  //
  // Option 2 — Nodemailer with Gmail SMTP
  //
  // For now, we log the message server-side:
  console.log("Contact form submission:", parsed.data);

  return { success: true, message: "Message sent! I'll get back to you soon." };
}
