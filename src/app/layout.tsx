import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Vazirmatn } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { UserSessionProvider } from "@/components/user-session-provider";
import { Toaster } from "@/lib/notify";
import { getUserBySessionToken, SESSION_COOKIE } from "@/lib/session";
import { PwaRegistrar } from "@/components/pwa-registrar";
import { OnboardingProvider } from "@/components/onboarding/onboarding-context";
import { SpotlightTour } from "@/components/onboarding/spotlight-tour";
import { Agentation } from "agentation";
import { BookmarksProvider } from "@/components/bookmarks-provider";
import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-vazirmatn",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#080d1a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL('https://farayandnama.ir'),
  title: {
    default: "سامانه فرآیندنما | راهنمای تعاملی و بصری فرایندهای سازمانی",
    template: "%s | فرآیندنما",
  },
  description: "جستجو، مشاهده فلوچارت زنده و اجرای گام‌به‌گام فرایندهای سازمانی و اداری با راهنمای جامع خطایابی و ابزارهای کمکی",
  keywords: [
    "فرآیندنما",
    "فرایندنما",
    "فرایند نما",
    "farayandnama",
    "farayandnama.ir",
    "سامانه فرآیندنما",
    "راهنمای فرایندهای اداری",
    "راهنمای سامانه های آموزشی",
    "فلوچارت فرایندها",
  ],
  manifest: "/manifest.webmanifest",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: "https://farayandnama.ir",
    siteName: "سامانه فرآیندنما",
    title: "سامانه فرآیندنما | راهنمای تعاملی و بصری فرایندهای سازمانی",
    description: "جستجو، مشاهده فلوچارت زنده و اجرای گام‌به‌گام فرایندهای سازمانی و اداری با راهنمای جامع خطایابی و ابزارهای کمکی",
    images: [
      {
        url: "/icons/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "لوگوی سامانه فرآیندنما",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "سامانه فرآیندنما | راهنمای تعاملی و بصری فرایندهای سازمانی",
    description: "جستجو، مشاهده فلوچارت زنده و اجرای گام‌به‌گام فرایندهای سازمانی و اداری با راهنمای جامع خطایابی",
    images: ["/icons/icon-512x512.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "فرآیندنما",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Seed the client session with the server-resolved user so first paint
  // already knows who is signed in (no /auth/me roundtrip flash). Reading
  // cookies() makes this layout dynamic, which it already effectively is.
  // Failures fall back to null — the provider revalidates client-side.
  let initialUser = null;
  try {
    const store = await cookies();
    initialUser = await getUserBySessionToken(store.get(SESSION_COOKIE)?.value);
  } catch {
    initialUser = null;
  }

  const websiteSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://farayandnama.ir/#website",
        "url": "https://farayandnama.ir",
        "name": "فرآیندنما",
        "alternateName": [
          "فرایندنما",
          "فرایند نما",
          "سامانه فرآیندنما",
          "Farayandnama",
          "FarayandNama",
          "farayandnama.ir",
        ],
        "description":
          "جستجو، مشاهده فلوچارت زنده و اجرای گام‌به‌گام فرایندهای سازمانی و اداری با راهنمای جامع خطایابی",
        "inLanguage": "fa-IR",
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://farayandnama.ir/?q={search_term_string}",
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": "https://farayandnama.ir/#organization",
        "name": "فرآیندنما",
        "alternateName": ["فرایندنما", "Farayandnama"],
        "url": "https://farayandnama.ir",
        "logo": {
          "@type": "ImageObject",
          "url": "https://farayandnama.ir/icons/icon-512x512.png",
          "width": 512,
          "height": 512,
        },
      },
    ],
  };

  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable} data-theme="light">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="font-sans antialiased min-h-screen">
        <ThemeProvider>
          <UserSessionProvider initialUser={initialUser}>
            <BookmarksProvider>
              <OnboardingProvider>
                {children}
                <SpotlightTour />
                <PwaRegistrar />
              </OnboardingProvider>
              <Toaster />
              {process.env.NODE_ENV === "development" && <Agentation />}
            </BookmarksProvider>
          </UserSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
