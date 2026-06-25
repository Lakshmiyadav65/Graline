import Link from "next/link";

/**
 * 4-column footer matching DESIGN.html footer.
 */
export function Footer() {
  return (
    <footer className="mt-[60px] border-t border-line py-10 pb-[60px] grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-10">
      <div>
        <h5 className="font-serif font-semibold text-[14px] uppercase tracking-[0.1em] mb-3.5">
          Grainline
        </h5>
        <p className="text-[14px] text-ink-soft leading-[1.6] max-w-[36ch] mt-2">
          Direct-trade rice from named farmers in villages across India. Fair prices, both ways.
        </p>
      </div>
      <FooterCol
        heading="Buy"
        links={[
          { label: "All Rice",      href: "/browse" },
          { label: "By Village",    href: "/villages" },
          { label: "By Variety",    href: "/browse" },
        ]}
      />
      <FooterCol
        heading="Sell"
        links={[
          { label: "Enroll your farm",    href: "/sell/enroll" },
          { label: "Farmer dashboard",    href: "/farmer-app" },
          { label: "How pricing works",   href: "/how-it-works" },
        ]}
      />
      <FooterCol
        heading="About"
        links={[
          { label: "How it works",    href: "/how-it-works" },
          { label: "Quality promise", href: "/how-it-works" },
          { label: "Contact us",      href: "/how-it-works" },
        ]}
      />
    </footer>
  );
}

function FooterCol({
  heading,
  links,
}: {
  heading: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h5 className="font-serif font-semibold text-[14px] uppercase tracking-[0.1em] mb-3.5">
        {heading}
      </h5>
      {links.map((link) => (
        <Link
          key={link.label}
          href={link.href}
          className="block text-ink-soft no-underline text-[14px] py-1 hover:text-terra transition-colors"
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}
