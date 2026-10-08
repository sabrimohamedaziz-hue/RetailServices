"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/logo";
import { CartBadge } from "@/components/cart-badge";
import { CurrencySelector } from "@/components/currency-selector";
import { getCurrency } from "@/lib/currency.server";
import type { CurrencyCode } from "@/lib/currency";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/actions/auth.actions";

type NavUser = {
  name: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
  balance: number | string;
};

const LINKS = [
  { href: "/store", label: "Store" },
  { href: "/cart", label: "Cart" },
  { href: "/wallet", label: "Wallet" },
  { href: "/orders", label: "Orders" },
];

export function Navbar({ user, currency }: { user: NavUser | null; currency: CurrencyCode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const links = user?.role === "ADMIN"
    ? [
        { href: "/admin", label: "Dashboard" },
        { href: "/admin/products", label: "Products" },
        { href: "/admin/deposits", label: "Deposits" },
        { href: "/admin/orders", label: "Orders" },
        { href: "/admin/customers", label: "Customers" },
        { href: "/store", label: "Store" },
      ]
    : LINKS;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-line bg-void/85 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className={cn("mx-auto flex max-w-6xl items-center justify-between px-4 transition-all duration-300 sm:px-6", scrolled ? "h-14" : "h-16")}>
        <Logo size={scrolled ? 30 : 34} />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm transition-colors",
                pathname === link.href
                  ? "bg-surface-2 text-ink"
                  : "text-ink-dim hover:text-ink"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <CurrencySelector active={currency} />
          <CartBadge />
          {user ? (
            <>
              {user.role === "CUSTOMER" && (
                <Link
                  href="/wallet"
                  className="badge-brand rounded-lg px-3 py-1.5 text-sm font-semibold"
                >
                  {formatMoney(user.balance)}
                </Link>
              )}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-ink-dim transition-colors hover:bg-surface-2 hover:text-ink"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand/20 text-xs font-semibold text-mint">
                    {user.name.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="max-w-28 truncate">{user.name}</span>
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden>
                    <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-xl border border-line bg-surface-2 py-1 shadow-xl">
                    <MenuItem href="/profile">Profile</MenuItem>
                    {user.role === "CUSTOMER" ? (
                      <>
                        <MenuItem href="/orders">Orders</MenuItem>
                        <MenuItem href="/wallet">Wallet</MenuItem>
                      </>
                    ) : (
                      <MenuItem href="/admin">Dashboard</MenuItem>
                    )}
                    <form action={logoutAction}>
                      <button
                        type="submit"
                        className="block w-full px-4 py-2 text-left text-sm text-danger transition-colors hover:bg-surface-3"
                      >
                        Logout
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost">
                Login
              </Link>
              <Link href="/register" className="btn-primary">
                Register
              </Link>
            </>
          )}
        </div>

        <button
          className="btn-ghost -mr-2 px-2 md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            {mobileOpen ? (
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-line bg-void/95 px-4 py-3 backdrop-blur-xl md:hidden">
          {user?.role === "CUSTOMER" && (
            <Link
              href="/wallet"
              className="badge-brand mb-3 inline-flex rounded-lg px-3 py-1.5 text-sm font-semibold"
            >
              {formatMoney(user.balance)}
            </Link>
          )}
          <div className="mb-3 flex items-center gap-3">
            <CurrencySelector active={currency} />
            <CartBadge />
          </div>
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm transition-colors",
                  pathname === link.href
                    ? "bg-surface-2 text-ink"
                    : "text-ink-dim hover:bg-surface-2 hover:text-ink"
                )}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link href="/profile" className="rounded-lg px-3 py-2.5 text-sm text-ink-dim hover:bg-surface-2 hover:text-ink">
                  Profile
                </Link>
                <form action={logoutAction}>
                  <button type="submit" className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-danger hover:bg-surface-2">
                    Logout
                  </button>
                </form>
              </>
            ) : (
              <div className="mt-2 flex gap-2">
                <Link href="/login" className="btn-secondary flex-1">
                  Login
                </Link>
                <Link href="/register" className="btn-primary flex-1">
                  Register
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

function MenuItem({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block px-4 py-2 text-sm text-ink-dim transition-colors hover:bg-surface-3 hover:text-ink"
    >
      {children}
    </Link>
  );
}
