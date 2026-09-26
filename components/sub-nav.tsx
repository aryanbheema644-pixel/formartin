import Link from "next/link";

export function SubNav({ items }: { items: { href: string; label: string }[] }) {
  return (
    <div className="mt-12 sticky top-16 z-30 -mx-6 px-6 py-3 backdrop-blur-xl bg-[rgba(5,6,10,0.7)] border-b hairline">
      <nav className="flex items-center gap-1 text-sm">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="px-3 py-1.5 rounded-md text-[color:var(--text-dim)] hover:text-white hover:bg-white/5 transition"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
