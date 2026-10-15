import type { Metadata } from "next";
import { Sora, DM_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
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
    default: "Jake Barrett — QA Automation Engineer & Web Developer",
    template: "%s | Jake Barrett",
  },
  description:
    "QA automation engineer at VML writing Playwright suites, and founder of Maroon Raccoon, building websites for artists and small businesses.",
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.png", sizes: "192x192", type: "image/png" },
    ],
    apple: { url: "/favicon.png", sizes: "180x180", type: "image/png" },
  },
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
      <body className="grain flex min-h-full flex-col overflow-x-clip font-body">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
