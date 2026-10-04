import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppShell } from "@/components/layout/AppShell";
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
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var authRaw = localStorage.getItem('sheomart-auth');
                  var userKey = 'sheomart_theme_guest';
                  if (authRaw) {
                    var parsed = JSON.parse(authRaw);
                    var u = parsed && parsed.state && parsed.state.user;
                    if (u && (u.userId || u.email)) {
                      userKey = 'sheomart_theme_user_' + (u.userId || u.email);
                    }
                  }
                  var platformDefault = localStorage.getItem('sheomart_platform_default_theme') || 'dark';
                  var stored = localStorage.getItem(userKey);
                  var isDark = stored ? stored === 'dark' : (platformDefault === 'dark');
                  var root = document.documentElement;
                  if (isDark) {
                    root.classList.add('dark');
                    root.setAttribute('data-theme', 'dark');
                    root.style.colorScheme = 'dark';
                  } else {
                    root.classList.remove('dark');
                    root.setAttribute('data-theme', 'light');
                    root.style.colorScheme = 'light';
                  }
                } catch (_) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full bg-[#FBFBF9] text-stone-900 dark:bg-stone-950 dark:text-stone-100 transition-colors duration-200">
        <GlobalProviders>
          <AppShell>{children}</AppShell>
        </GlobalProviders>
      </body>
    </html>
  );
}
