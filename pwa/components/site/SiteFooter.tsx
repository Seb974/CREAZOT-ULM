import Link from "next/link";

function AirplaneLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
    </svg>
  );
}

interface SiteFooterProps {
  email?: string;
  siteName?: string;
}

export default function SiteFooter({
  email = "contact@creazot.com",
  siteName = "C6L",
}: SiteFooterProps) {
  const footerLinks = [
    {
      title: "Produit",
      links: [
        { label: "Fonctionnalités", href: "/#features" },
        { label: "Modules", href: "/#modules" },
        { label: "Tarifs", href: "/pricing" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "Guide utilisateur", href: "/guide" },
        { label: "Contact", href: "/contact" },
        { label: email, href: `mailto:${email}` },
      ],
    },
    {
      title: "Légal",
      links: [
        { label: "CGU", href: "/cgu" },
        { label: "Confidentialité", href: "/privacy" },
      ],
    },
  ];
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between md:gap-16">
          <div className="shrink-0">
            <Link href="/" className="group flex items-center gap-1.5 no-underline">
              <span className="text-2xl font-bold text-white">{siteName}</span>
              <AirplaneLogo className="w-[18px] h-[18px] rotate-45 text-cyan-400" />
            </Link>
            <p className="mt-1 text-sm text-gray-400">Gestion Aéronautique</p>
            <Link
              href="/admin"
              className="mt-4 inline-block rounded-lg border border-gray-600 px-4 py-2 text-xs font-medium text-gray-300 no-underline transition-colors hover:border-white hover:text-white"
            >
              Accéder à mon espace →
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-8 text-sm">
            {footerLinks.map((section) => (
              <div key={section.title}>
                <h3 className="font-semibold uppercase tracking-wider text-white text-xs mb-3">
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-gray-400 no-underline hover:text-white transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 border-t border-gray-800 pt-6">
          <p className="text-xs text-gray-500">
            &copy; 2026 CREAZOT &middot; Tous droits réservés &middot; La Réunion, France
          </p>
        </div>
      </div>
    </footer>
  );
}
