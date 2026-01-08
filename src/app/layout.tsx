import clsx from "clsx";
import { GeistMono } from "geist/font/mono";
import { Inter, Noto_Sans_Devanagari, Mukta } from "next/font/google";
import type { Metadata } from "next";
import type React from "react";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-devanagari",
});

const mukta = Mukta({
  subsets: ["latin", "devanagari"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mukta",
});

export const metadata: Metadata = {
  title: {
    default: "The Stack Hub Admin",
    template: "%s | The Stack Hub",
  },
  description: "The Stack Hub - Foundation First, Excellence Always",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png" },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={clsx(
        GeistMono.variable,
        inter.variable,
        notoSansDevanagari.variable,
        mukta.variable,
        "scroll-pt-16 font-sans antialiased bg-neutral-50 dark:bg-neutral-950"
      )}
    >
      <body suppressHydrationWarning>
        {/* Inline script to prevent FOUC - runs before React hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <div className="isolate">{children}</div>
      </body>
    </html>
  );
}
