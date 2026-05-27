import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/Toaster';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// ─── SEO & Metadata ────────────────────────────────────────────────────────────

const BASE_URL = 'https://teams.damnx.co.in';

export const metadata: Metadata = {
  // ── Core ──────────────────────────────────────────────────────────────────
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'NEXUS by Damnx Solutions | AI-Powered Team & Project Management',
    template: '%s | NEXUS – Damnx Solutions',
  },
  description:
    'NEXUS is the AI-enabled team and project management platform by Damnx Solutions. Plan smarter, collaborate faster, and ship better — built for high-performance teams.',
  keywords: [
    'Damnx Solutions',
    'NEXUS',
    'AI project management',
    'AI team management',
    'Damnx',
    'teams.damnx.co.in',
    'project management software',
    'team collaboration tool',
    'AI-powered productivity',
    'task management',
    'sprint planning',
    'agile project management',
    'remote team management',
    'Damnx NEXUS',
  ],
  authors: [{ name: 'Damnx Solutions', url: 'https://damnx.co.in' }],
  creator: 'Damnx Solutions',
  publisher: 'Damnx Solutions',
  category: 'Technology',

  // ── Canonical & Alternate URLs ─────────────────────────────────────────────
  alternates: {
    canonical: BASE_URL,
  },

  // ── Robots ────────────────────────────────────────────────────────────────
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // ── Open Graph (Facebook, LinkedIn, WhatsApp, etc.) ───────────────────────
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: BASE_URL,
    siteName: 'NEXUS by Damnx Solutions',
    title: 'NEXUS by Damnx Solutions | AI-Powered Team & Project Management',
    description:
      'NEXUS is the AI-enabled team and project management platform by Damnx Solutions. Plan smarter, collaborate faster, and ship better.',
    images: [
      {
        url: '/og-image.png',        // Place a 1200×630 image at /public/og-image.png
        width: 1200,
        height: 630,
        alt: 'NEXUS – AI Project Management by Damnx Solutions',
        type: 'image/png',
      },
    ],
  },

  // ── Twitter / X Card ──────────────────────────────────────────────────────
  twitter: {
    card: 'summary_large_image',
    title: 'NEXUS by Damnx Solutions | AI-Powered Team & Project Management',
    description:
      'Plan smarter, collaborate faster, and ship better with NEXUS — the AI-enabled project management platform by Damnx Solutions.',
    images: ['/og-image.png'],
    creator: '@damnxsolutions',   // Update to your actual Twitter/X handle
    site: '@damnxsolutions',
  },

  // ── Icons & PWA ───────────────────────────────────────────────────────────
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  manifest: '/site.webmanifest',   // Add a PWA manifest for extra credibility

  // ── App-specific ──────────────────────────────────────────────────────────
  applicationName: 'NEXUS',
  referrer: 'origin-when-cross-origin',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

// ─── JSON-LD Structured Data ───────────────────────────────────────────────────
// Helps Google understand the product & organisation, boosting brand SERP presence.

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://damnx.co.in/#organization',
      name: 'Damnx Solutions',
      url: 'https://damnx.co.in',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/logo.png`,
      },
      sameAs: [
        // Add your real social profiles here
        'https://twitter.com/damnxsolutions',
        'https://linkedin.com/company/damnxsolutions',
      ],
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${BASE_URL}/#software`,
      name: 'NEXUS',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      url: BASE_URL,
      description:
        'NEXUS is an AI-enabled team and project management platform developed by Damnx Solutions for high-performance teams.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'INR',
      },
      author: {
        '@id': 'https://damnx.co.in/#organization',
      },
      publisher: {
        '@id': 'https://damnx.co.in/#organization',
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${BASE_URL}/#website`,
      url: BASE_URL,
      name: 'NEXUS by Damnx Solutions',
      publisher: {
        '@id': 'https://damnx.co.in/#organization',
      },
    },
  ],
};

// ─── Root Layout ───────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* JSON-LD structured data injected directly — no extra package needed */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Preconnect to Google Fonts for performance (already used by next/font) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen flex flex-col bg-background text-foreground">
        {children}
        <Toaster />
      </body>
    </html>
  );
}