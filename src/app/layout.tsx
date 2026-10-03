import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { UserSessionProvider } from "@/components/user-session-provider";
import { Toaster } from "@/lib/notify";
import { Agentation } from "agentation";
import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-vazirmatn",
  display: "swap",
});

export const metadata: Metadata = {
  title: "سامانه فناوری | راهنمای تعاملی و بصری فرایندهای سازمانی",
  description: "جستجو، مشاهده فلوچارت زنده و اجرای گام‌به‌گام فرایندهای سازمانی و اداری با راهنمای جامع خطایابی و ابزارهای کمکی",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable} data-theme="light">
      <body className="font-sans antialiased min-h-screen">
        <ThemeProvider>
          <UserSessionProvider>
            {children}
            <Toaster />
            {process.env.NODE_ENV === "development" && <Agentation />}
          </UserSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
