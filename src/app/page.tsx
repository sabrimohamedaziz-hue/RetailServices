import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/reveal";
import { Crystal } from "@/components/crystal";
import { getFeaturedProducts } from "@/lib/services/product.service";
import { getCurrency } from "@/lib/currency.server";
import { CATEGORIES } from "@/lib/constants";

const CATEGORIES_WITH_ICONS: Record<string, string> = {
  Gaming: "🎮",
  Subscriptions: "💳",
  "Digital Products": "🎁",
  Boosts: "🚀",
};

const CATEGORY_BLURBS: Record<string, string> = {
  Gaming: "Games, top-ups and in-game goods.",
  Subscriptions: "Premium accounts and monthly plans.",
  "Digital Products": "Keys, codes and digital goods.",
  Boosts: "Ranked and progression services.",
};

const STEPS = [
  { title: "Create your account", detail: "Sign up in seconds with your email." },
  { title: "Add balance", detail: "Top up your Retail Wallet via Discord." },
  { title: "Choose a product", detail: "Browse the store and pick what you need." },
  { title: "Receive your order", detail: "Our team fulfills your order manually." },
];

export default async function HomePage() {
  const [featured, currency] = await Promise.all([
    getFeaturedProducts(4),
    getCurrency(),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-brand/10 blur-[140px]"
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-20 sm:px-6 sm:pt-28 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            <Image
              src="/logo.png"
              alt="RetailServices logo"
              width={96}
              height={96}
              priority
              className="mb-8 rounded-2xl ring-1 ring-line-strong mx-auto lg:mx-0"
            />
            <p className="mb-4 text-xs font-semibold tracking-[0.35em] text-mint">
              RETAILSERVICES
            </p>
            <h1 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              <span className="text-aurora">Digital products,</span> delivered instantly
            </h1>
            <p className="mt-5 max-w-xl text-base text-ink-dim sm:text-lg mx-auto lg:mx-0">
              Keys, licenses and downloads land in your account seconds after checkout — backed by
              people who actually reply.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link href="/store" className="btn-primary min-w-40">
                Browse Store
              </Link>
              <a
                href={process.env.DISCORD_INVITE_URL ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary min-w-40"
              >
                Join Discord
              </a>
            </div>
          </div>
          <div className="relative hidden sm:block">
            <Crystal />
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <Reveal className="mx-auto max-w-6xl px-4 pb-4 sm:px-6">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: "⚡", title: "Instant delivery", detail: "Orders are processed the moment payment clears." },
            { icon: "🔒", title: "Secure checkout", detail: "All payments are encrypted and safe." },
            { icon: "💬", title: "Real human support", detail: "Our team replies on Discord, fast." },
          ].map((t) => (
            <div key={t.title} className="card flex items-center gap-4 p-5">
              <span className="text-2xl" aria-hidden>{t.icon}</span>
              <div>
                <p className="font-medium text-ink">{t.title}</p>
                <p className="text-sm text-ink-mute">{t.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Popular right now */}
      {featured.length > 0 && (
        <Reveal className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Popular right now</h2>
              <p className="mt-1 text-sm text-ink-mute">
                Delivered automatically the moment payment clears.
              </p>
            </div>
            <Link href="/store" className="btn-ghost hidden sm:inline-flex">
              View all
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} currency={currency} />
            ))}
          </div>
        </Reveal>
      )}

      {/* Brands we cover */}
      <Reveal className="mx-auto max-w-6xl px-4 pb-6 sm:px-6">
        <p className="mb-5 text-center text-xs font-semibold uppercase tracking-[0.3em] text-ink-mute">
          Brands we cover
        </p>
        <div className="card flex flex-wrap items-center justify-center gap-x-8 gap-y-4 p-6">
          {["Spotify", "Netflix", "Discord", "YouTube", "NordVPN", "Steam", "CapCut", "ChatGPT", "Canva", "Crunchyroll"].map((brand) => (
            <span key={brand} className="text-lg font-semibold tracking-wide text-ink-dim/70 transition-colors hover:text-ink">
              {brand}
            </span>
          ))}
        </div>
      </Reveal>

      {/* Categories */}
      <Reveal className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="mb-8 text-2xl font-semibold tracking-tight">Categories</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((category) => (
            <Link
              key={category}
              href={`/store?category=${encodeURIComponent(category)}`}
              className="card card-hover group p-6"
            >
              <div className="mb-5 text-4xl" aria-hidden>
                {CATEGORIES_WITH_ICONS[category] ?? "✨"}
              </div>
              <h3 className="font-medium text-ink">{category}</h3>
              <p className="mt-1 text-sm text-ink-mute">{CATEGORY_BLURBS[category]}</p>
            </Link>
          ))}
        </div>
      </Reveal>

      {/* How it works */}
      <Reveal className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="mb-10 text-2xl font-semibold tracking-tight">How It Works</h2>
        <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <li key={step.title} className="card relative p-6">
              <span className="text-3xl font-semibold text-brand/50">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 font-medium text-ink">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-mute">{step.detail}</p>
            </li>
          ))}
        </ol>
      </Reveal>

      {/* Secure checkout */}
      <Reveal className="mx-auto max-w-6xl px-4 pb-14 sm:px-6">
        <div className="card p-8 text-center">
          <p className="mb-2 text-2xl">🔒</p>
          <h2 className="text-xl font-semibold tracking-tight">Secure checkout</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-mute">
            All major payment methods accepted — wallet, crypto and bank transfer via Discord
            ticket. Every transaction is encrypted.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {["Wallet", "Crypto", "Discord ticket", "Bank transfer"].map((m) => (
              <span key={m} className="badge-gray px-3 py-1.5 text-xs">{m}</span>
            ))}
          </div>
        </div>
      </Reveal>
    </div>
  );
}
