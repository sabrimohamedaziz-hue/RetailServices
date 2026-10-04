import Link from "next/link";
import { Logo } from "@/components/logo";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-line/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xs space-y-3">
          <Logo size={28} />
          <p className="text-sm leading-relaxed text-ink-mute">
            Premium digital products and gaming services, made simple.
          </p>
        </div>
        <div className="flex gap-16 text-sm">
          <div className="space-y-2.5">
            <p className="font-medium text-ink">Store</p>
            <FooterLink href="/store">Browse products</FooterLink>
            <FooterLink href="/store?category=Gaming">Gaming</FooterLink>
            <FooterLink href="/store?category=Subscriptions">Subscriptions</FooterLink>
          </div>
          <div className="space-y-2.5">
            <p className="font-medium text-ink">Account</p>
            <FooterLink href="/wallet">Wallet</FooterLink>
            <FooterLink href="/orders">Orders</FooterLink>
            <FooterLink href="/profile">Profile</FooterLink>
          </div>
        </div>
      </div>
      <div className="border-t border-line/50 py-5 text-center text-xs text-ink-mute">
        © {new Date().getFullYear()} RetailServices. All rights reserved.
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="block text-ink-mute transition-colors hover:text-ink">
      {children}
    </Link>
  );
}
