import type { Metadata } from "next";
import { Sora, DM_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Jake Barrett — Developer",
    template: "%s | Jake Barrett",
  },
  description:
    "Full-stack developer passionate about clean UI and thoughtful backend logic.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="grain flex min-h-full flex-col font-body">
        <Navbar />
        <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-16">
          {children}
        </main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
