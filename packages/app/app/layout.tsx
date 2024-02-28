import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { ProgressBarProvider } from "@/components/ProgressBarProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Collaborative Note Taking App Example",
  description:
    "Built with Next.js, Supabase, Cloudflare Durable Objects, Y.js, and Tiptap",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ProgressBarProvider>{children}</ProgressBarProvider>
        <Toaster />
      </body>
    </html>
  );
}
