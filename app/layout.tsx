import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "../lib/contexts/auth-context";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "BuffrSign - AI-Powered Digital Signatures for Namibia | CRAN Ready",
  description: "The first AI-powered digital signature platform built for Namibian businesses. Get documents signed in minutes, not days. ETA 2019 compliant, CRAN accredited, and powered by advanced AI technology.",
  keywords: [
    "digital signatures",
    "Namibia",
    "ETA 2019",
    "CRAN",
    "AI-powered",
    "document signing",
    "legal compliance",
    "electronic transactions",
    "business automation",
    "contract management"
  ],
  authors: [{ name: "BuffrSign Team" }],
  creator: "BuffrSign",
  publisher: "BuffrSign",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "BuffrSign - AI-Powered Digital Signatures for Namibia",
    description: "Get documents signed in minutes, not days. The first AI-powered digital signature platform built for Namibian businesses.",
    url: "https://buffrsign.ai",
    siteName: "BuffrSign",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "BuffrSign - AI-Powered Digital Signatures",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BuffrSign - AI-Powered Digital Signatures for Namibia",
    description: "Get documents signed in minutes, not days. ETA 2019 compliant and CRAN accredited.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-theme="buffrsign">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="BuffrSign" />
        <meta name="application-name" content="BuffrSign" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="buffrsign"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
