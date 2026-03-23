import Link from "next/link";

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
      { label: "Contact", href: "/contact" },
      { label: "contact@creazot.com", href: "mailto:contact@creazot.com" },
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

export default function SiteFooter() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between md:gap-16">
          <div className="shrink-0">
            <Link href="/" className="text-2xl font-bold no-underline">
              <span className="text-white">C</span>
              <span className="text-cyan-500">6</span>
              <span className="text-white">L</span>
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
