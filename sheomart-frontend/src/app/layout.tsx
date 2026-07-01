import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { GlobalProviders } from "@/providers/global-providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SheoMart",
  description: "A modern grocery commerce experience built with Next.js and a thoughtful design system.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-stone-50 text-stone-900 transition-colors duration-300 dark:bg-stone-950 dark:text-stone-100">
        <GlobalProviders>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
              <RouteGuard>{children}</RouteGuard>
            </main>
            <Footer />
          </div>
        </GlobalProviders>
      </body>
    </html>
  );
}
