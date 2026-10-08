import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/reveal";
import { StatCounter } from "@/components/stat-counter";
import { BrandLogo } from "@/components/brand-logo";
import { PrismDivider } from "@/components/prism-divider";
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
  { title: "Receive your order", detail: "Our team verifies payment and sends details." },
];

const BRANDS = [
  "Spotify",
  "Netflix",
  "Discord",
  "YouTube",
  "NordVPN",
  "Steam",
  "CapCut",
  "ChatGPT",
  "Canva",
  "Crunchyroll",
  "Dazn",
  "Prime Video",
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
        <div className="studio-light" aria-hidden />
        <div className="hero-glow" aria-hidden />
        <div className="relative mx-auto max-w-4xl px-4 pb-20 pt-20 text-center sm:px-6 sm:pt-28">
          <div className="mb-8 flex justify-center">
            <BrandLogo size={128} ring />
          </div>

          <div className="relative mx-auto mb-8 inline-flex items-center gap-2.5 rounded-full border border-line bg-surface/70 px-4 py-2 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
              <span className="ping-ring" />
            </span>
            <span className="text-xs font-medium text-ink-dim">
              Instant delivery · online now
            </span>
          </div>

          <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            <span className="text-aurora">Digital products,</span>
            <br />
            delivered instantly
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base text-ink-dim sm:text-lg">
            Keys, licenses and downloads land in your account seconds after checkout — backed by
            people who actually reply.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/store" className="btn-primary min-w-40">
              Browse products
            </Link>
            <a
              href={process.env.DISCORD_INVITE_URL ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary min-w-40"
            >
              Read reviews
            </a>
          </div>

          <div className="mx-auto mt-14 grid max-w-2xl grid-cols-3 gap-4">
            <StatCounter value={9} suffix="k+" label="Orders delivered" />
            <StatCounter value={5} suffix=" min" label="Avg. delivery" />
            <StatCounter value={24} suffix="/7" label="Support" />
          </div>
        </div>
      </section>

      <PrismDivider />

      {/* Trust bar */}
      <Reveal className="mx-auto max-w-6xl px-4 pb-4 sm:px-6">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: "⚡", title: "Instant delivery", detail: "Orders are processed the moment payment clears." },
            { icon: "🔒", title: "Secure checkout", detail: "All payments are encrypted and safe." },
            { icon: "💬", title: "Real human support", detail: "Our team replies on Discord, fast." },
          ].map((t) => (
            <div key={t.title} className="card card-hover flex items-center gap-4 p-5">
              <span className="text-2xl" aria-hidden>{t.icon}</span>
              <div>
                <p className="font-display font-medium text-ink">{t.title}</p>
                <p className="text-sm text-ink-mute">{t.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Popular right now */}
      {featured.length > 0 && (
        <Reveal className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="mb-10 text-center">
            <p className="eyebrow justify-center">Popular right now</p>
            <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Delivered the moment payment clears
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} currency={currency} />
            ))}
          </div>
        <div className="mt-7 flex justify-center">
            <Link href="/store" className="btn-ghost">
              View all products →
            </Link>
          </div>
        </Reveal>
      )}

      <PrismDivider />

      {/* Brands marquee */}
      <Reveal className="overflow-hidden pb-14">
        <p className="eyebrow mb-6 justify-center">Brands we cover</p>
        <div className="marquee-fade">
          <div className="marquee-track gap-12" style={{ "--dur": "28s" } as React.CSSProperties}>
            {[...BRANDS, ...BRANDS].map((brand, i) => (
              <span
                key={i}
                className="font-display whitespace-nowrap text-lg font-semibold tracking-wide text-ink-dim/60 transition-colors hover:text-ink"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Categories */}
      <Reveal className="mx-auto max-w-6xl px-4 pb-14 sm:px-6">
        <h2 className="font-display mb-8 text-center text-3xl font-semibold tracking-tight sm:text-4xl">
          Browse by category
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((category, i) => (
            <Link
              key={category}
              href={`/store?category=${encodeURIComponent(category)}`}
              className="card card-hover group p-6"
            >
              <div className="relative mb-5 flex h-12 w-12 items-center justify-center">
                <span className="absolute inset-0 rounded-full border border-brand/20" />
                <span className="radar-sweep absolute inset-0 rounded-full opacity-60" />
                <span className="text-xl" aria-hidden>
                  {CATEGORIES_WITH_ICONS[category] ?? "✨"}
                </span>
              </div>
              <h3 className="font-display font-medium text-ink">{category}</h3>
              <p className="mt-1 text-sm text-ink-mute">{CATEGORY_BLURBS[category]}</p>
              <span
                className="chip-ring mt-4 inline-flex rounded-full border border-line px-3 py-1 text-xs"
                style={{ animationDelay: `${i * 0.6}s` }}
              >
                Browse
              </span>
            </Link>
          ))}
        </div>
      </Reveal>

      {/* How it works */}
      <Reveal className="mx-auto max-w-6xl px-4 pb-14 sm:px-6">
        <h2 className="mb-10 text-center font-display text-2xl font-semibold tracking-tight">
          How it works
        </h2>
        <div className="relative">
          <div className="steps-line absolute left-0 right-0 top-6 hidden h-px lg:block" aria-hidden />
          <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <li key={step.title} className="card card-hover relative p-6">
                <span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-brand/30 bg-surface font-display text-sm font-semibold text-mint">
                  {String(index + 1).padStart(2, "0")}
                  <span className="ping-ring" />
                </span>
                <h3 className="mt-4 font-display font-medium text-ink">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-mute">{step.detail}</p>
              </li>
            ))}
          </ol>
        </div>
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
