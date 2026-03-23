import Link from "next/link";

const footerSections = [
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
      { label: "Email", href: "mailto:contact@creazot.com" },
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
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Brand */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold">
            C<span className="text-cyan-500">6</span>L
          </h2>
          <p className="mt-2 text-sm text-gray-400">Gestion Aéronautique</p>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 no-underline hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider + copyright */}
        <div className="border-t border-gray-800 pt-8">
          <p className="text-sm text-gray-500">
            &copy; 2026 CREAZOT &middot; Tous droits réservés
          </p>
        </div>
      </div>
    </footer>
  );
}
