const MESSAGES = [
  "⚡ Instant delivery — orders delivered within minutes",
  "🔒 Secure checkout — every transaction encrypted",
  "💬 Real human support — replies on Discord",
  "🌍 5 currencies supported — EUR · GBP · USD · CAD · AUD",
  "🎮 Gaming · Subscriptions · Boosts · Digital products",
];

export function AnnouncementBar() {
  const row = [...MESSAGES, ...MESSAGES];

  return (
    <div className="relative overflow-hidden border-b border-line/70 bg-surface/80">
      <div className="marquee-track py-2" style={{ "--dur": "34s" } as React.CSSProperties}>
        {row.map((message, i) => (
          <span key={i} className="whitespace-nowrap px-6 text-xs font-medium text-ink-dim">
            {message}
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-void to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-void to-transparent" />
    </div>
  );
}