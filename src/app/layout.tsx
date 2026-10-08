import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { ToastProvider } from "@/components/ui/toaster";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { AnnouncementBar } from "@/components/announcement-bar";
import { getSessionUser } from "@/lib/auth";
import { getCurrency } from "@/lib/currency.server";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-poppins" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "RetailServices — Digital products, delivered instantly",
    template: "%s · RetailServices",
  },
  description:
    "Keys, licenses and downloads land in your account seconds after checkout, backed by people who actually reply.",
  openGraph: {
    siteName: "RetailServices",
    title: "RetailServices — Digital products, delivered instantly",
    description: "Keys, licenses and downloads land in your account seconds after checkout.",
    images: ["/logo.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [user, currency] = await Promise.all([getSessionUser(), getCurrency()]);

  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="flex min-h-screen flex-col">
        <div className="pfx-glows" aria-hidden />
        <div className="pfx-dots" aria-hidden>
          {DOTS.map((d, i) => (
            <span
              key={i}
              className="pfx-dot"
              style={
                {
                  "--x": d.x,
                  "--s": d.s,
                  "--d": d.d,
                  "--delay": d.delay,
                  "--sway": d.sway,
                  "--o": d.o,
                } as React.CSSProperties
              }
            />
          ))}
        </div>

        <AnnouncementBar />

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
            currency={currency}
          />
          <main className="flex-1">{children}</main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}

const DOTS = [
  { x: "6%", s: "6px", d: "16s", delay: "-2s", sway: "38px", o: "0.4" },
  { x: "17%", s: "4px", d: "21s", delay: "-9s", sway: "-52px", o: "0.32" },
  { x: "28%", s: "8px", d: "19s", delay: "-5s", sway: "26px", o: "0.28" },
  { x: "38%", s: "5px", d: "24s", delay: "-14s", sway: "-40px", o: "0.38" },
  { x: "49%", s: "7px", d: "17s", delay: "-7s", sway: "48px", o: "0.3" },
  { x: "59%", s: "4px", d: "22s", delay: "-16s", sway: "-30px", o: "0.42" },
  { x: "69%", s: "9px", d: "20s", delay: "-3s", sway: "36px", o: "0.26" },
  { x: "78%", s: "5px", d: "26s", delay: "-19s", sway: "-46px", o: "0.36" },
  { x: "88%", s: "7px", d: "18s", delay: "-11s", sway: "30px", o: "0.3" },
  { x: "95%", s: "4px", d: "23s", delay: "-6s", sway: "-34px", o: "0.4" },
];