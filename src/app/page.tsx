import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { getFeaturedProducts } from "@/lib/services/product.service";
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
  const featured = await getFeaturedProducts(4);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-brand/10 blur-[140px]"
        />
        <div className="relative mx-auto flex max-w-4xl flex-col items-center px-4 pb-20 pt-20 text-center sm:px-6 sm:pt-28">
          <Image
            src="/logo.png"
            alt="RetailServices logo"
            width={128}
            height={128}
            priority
            className="mb-8 rounded-3xl ring-1 ring-line-strong"
          />
          <p className="mb-4 text-xs font-semibold tracking-[0.35em] text-mint">
            RETAILSERVICES
          </p>
          <h1 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Power Up Your Digital Experience
          </h1>
          <p className="mt-5 max-w-xl text-base text-ink-dim sm:text-lg">
            Premium digital products and gaming services, made simple.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
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
      </section>

      {/* Featured products */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Featured Products</h2>
              <p className="mt-1 text-sm text-ink-mute">Hand-picked from the RetailServices store.</p>
            </div>
            <Link href="/store" className="btn-ghost hidden sm:inline-flex">
              View all
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
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
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
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
      </section>
    </div>
  );
}
