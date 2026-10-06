import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ToastProvider } from "@/components/ui/toaster";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { getSessionUser } from "@/lib/auth";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "RetailServices — Power Up Your Digital Experience",
    template: "%s · RetailServices",
  },
  description:
    "Premium digital products and gaming services, made simple.",
  openGraph: {
    siteName: "RetailServices",
    title: "RetailServices — Power Up Your Digital Experience",
    description: "Premium digital products and gaming services, made simple.",
    images: ["/logo.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getSessionUser();

  return (
    <html lang="en" className={inter.variable}>
      <body className="flex min-h-screen flex-col">
        <div className="ambient" aria-hidden>
          <div className="orb orb-3" />
        </div>
        <ToastProvider>
          <Navbar
            user={
              user
                ? {
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    balance: user.balance.toString(),
                  }
                : null
            }
          />
          <main className="flex-1">{children}</main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
