import Link from "next/link";

const pricingTiers = [
  {
    range: "1-5",
    label: "aéronefs",
    price: "8.00",
    suffix: "€/aéronef/mois",
    popular: false,
  },
  {
    range: "6-15",
    label: "aéronefs",
    price: "6.50",
    suffix: "€/aéronef/mois",
    popular: true,
  },
  {
    range: "16-30",
    label: "aéronefs",
    price: "5.00",
    suffix: "€/aéronef/mois",
    popular: false,
  },
  {
    range: "31+",
    label: "aéronefs",
    price: null,
    suffix: "Sur devis",
    popular: false,
  },
];

const modulePacks = [
  {
    name: "Pack Base",
    included: true,
    price: null,
    priceLabel: "Inclus",
    description: "Les fondamentaux pour démarrer",
    features: [
      "Tableau de bord opérationnel",
      "Gestion des passagers",
      "Réservations de base",
    ],
    highlight: false,
  },
  {
    name: "Pack Vol",
    included: false,
    price: "9.90" /* TODO: fetch from API */,
    priceLabel: null,
    description: "Suivi complet de l'activité aérienne",
    features: [
      "Carnets de vols",
      "Horamètres automatiques",
      "Statistiques de vol",
    ],
    highlight: true,
  },
  {
    name: "Pack Maintenance",
    included: false,
    price: "14.90" /* TODO: fetch from API */,
    priceLabel: null,
    description: "Maîtrisez l'état de votre flotte",
    features: [
      "Gestion de la flotte",
      "Butées entretien",
      "Alertes visuelles",
      "Changement moteur",
    ],
    highlight: false,
  },
  {
    name: "Pack Pilote",
    included: false,
    price: "12.90" /* TODO: fetch from API */,
    priceLabel: null,
    description: "Conformité et qualifications pilotes",
    features: [
      "Profils pilotes complets",
      "Qualifications & licences",
      "Certificats médicaux",
      "Alertes J-30 / J-7",
    ],
    highlight: false,
  },
  {
    name: "Pack Prépaiements",
    included: false,
    price: "7.90" /* TODO: fetch from API */,
    priceLabel: null,
    description: "Bons cadeaux et prépaiements",
    features: [
      "Bons cadeaux",
      "Synchronisation Wix",
      "Génération PDF automatique",
    ],
    highlight: false,
  },
];

export default function PricingPage() {
  const exampleAeronefs = 5;
  const examplePricePerAeronef = 8.0;
  const examplePackVol = 9.9;
  const examplePackMaintenance = 14.9;
  const exampleTotal =
    exampleAeronefs * examplePricePerAeronef +
    examplePackVol +
    examplePackMaintenance;

  return (
    <div className="font-sans">
      {/* ── Hero compact ── */}
      <section className="bg-gradient-to-b from-gray-950 to-gray-900 pb-20 pt-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-cyan-500">
            Tarification
          </p>
          <h1 className="text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            Tarifs simples, transparents
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-400">
            Choisissez les modules dont vous avez besoin.
            <br />
            Payez uniquement ce que vous utilisez.
          </p>
        </div>
      </section>

      {/* ── Prix par aéronef ── */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
              Prix par aéronef
            </h2>
            <p className="mt-4 text-base text-gray-500">
              Un tarif dégressif selon la taille de votre flotte.
              Plus vous avez d&apos;aéronefs, moins vous payez par appareil.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {pricingTiers.map((tier) => (
              <div
                key={tier.range}
                className={`relative rounded-xl border p-6 text-center shadow-sm transition-all hover:shadow-md ${
                  tier.popular
                    ? "border-cyan-500 ring-2 ring-cyan-500/20"
                    : "border-gray-200"
                }`}
              >
                {tier.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-cyan-700 px-4 py-1 text-xs font-semibold text-white">
                    Populaire
                  </span>
                )}
                <p className="text-3xl font-bold text-gray-900">
                  {tier.range}
                </p>
                <p className="mt-1 text-sm text-gray-500">{tier.label}</p>
                <div className="my-5 h-px bg-gray-100" />
                {tier.price ? (
                  <>
                    <p className="text-4xl font-bold text-cyan-700">
                      {tier.price}
                      <span className="text-lg font-normal text-gray-400">
                        €
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-gray-500">{tier.suffix}</p>
                  </>
                ) : (
                  <p className="text-xl font-semibold text-gray-700">
                    {tier.suffix}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Packs de modules ── */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
              Packs de modules
            </h2>
            <p className="mt-4 text-base text-gray-500">
              Composez votre offre à la carte.
              Le Pack Base est inclus pour tous les clubs.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {modulePacks.map((pack) => (
              <div
                key={pack.name}
                className={`relative flex flex-col rounded-xl border p-6 shadow-sm transition-all hover:shadow-md ${
                  pack.included
                    ? "border-cyan-500 bg-cyan-200/20"
                    : pack.highlight
                      ? "border-cyan-500 bg-white ring-2 ring-cyan-500/20"
                      : "border-gray-200 bg-white"
                }`}
              >
                {pack.included && (
                  <span className="absolute -top-3 right-4 rounded-full bg-cyan-700 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                    Inclus
                  </span>
                )}
                {pack.highlight && (
                  <span className="absolute -top-3 right-4 rounded-full bg-cyan-700 px-3 py-1 text-xs font-semibold text-white">
                    Recommandé
                  </span>
                )}

                <h3 className="text-lg font-bold text-gray-900">
                  {pack.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {pack.description}
                </p>

                <div className="my-5 h-px bg-gray-200" />

                <ul className="flex-1 space-y-2.5">
                  {pack.features.map((feat) => (
                    <li
                      key={feat}
                      className="flex items-start gap-2 text-sm text-gray-700"
                    >
                      <svg
                        className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-700"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {feat}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 border-t border-gray-100 pt-4">
                  {pack.priceLabel ? (
                    <p className="text-center text-xl font-bold text-cyan-700">
                      {pack.priceLabel}
                    </p>
                  ) : (
                    <p className="text-center">
                      <span className="text-3xl font-bold text-gray-900">
                        {pack.price}
                      </span>
                      <span className="text-sm text-gray-500"> €/mois</span>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Récapitulatif / Simulateur ── */}
      <section className="bg-gray-100 py-20">
        <div className="mx-auto max-w-3xl px-6">
          <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
            <h2 className="text-center text-2xl font-bold text-gray-900">
              Exemple de tarif
            </h2>
            <p className="mt-2 text-center text-sm text-gray-500">
              Pour un club avec 5 aéronefs
            </p>

            <div className="mt-8 space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                <span className="text-sm text-gray-700">
                  5 aéronefs × 8,00 €/mois
                </span>
                <span className="font-semibold text-gray-900">40,00 €</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                <span className="text-sm text-gray-700">
                  Pack Base
                </span>
                <span className="font-semibold text-cyan-700">Gratuit</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                <span className="text-sm text-gray-700">
                  Pack Vol
                </span>
                <span className="font-semibold text-gray-900">9,90 €</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                <span className="text-sm text-gray-700">
                  Pack Maintenance
                </span>
                <span className="font-semibold text-gray-900">14,90 €</span>
              </div>

              <div className="h-px bg-gray-200" />

              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-base font-bold text-gray-900">
                  Total mensuel
                </span>
                <span className="text-2xl font-bold text-cyan-700">
                  {exampleTotal.toFixed(2).replace(".", ",")} €
                  <span className="text-sm font-normal text-gray-500">
                    /mois
                  </span>
                </span>
              </div>
            </div>

            <div className="mt-6 rounded-lg bg-cyan-200/30 px-4 py-3 text-center">
              <p className="text-sm font-medium text-cyan-700">
                Essai gratuit 30 jours inclus — sans carte bancaire
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Final ── */}
      <section className="bg-gradient-to-br from-cyan-700 to-cyan-800 py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Prêt à décoller ?
          </h2>
          <p className="mt-4 text-lg text-cyan-100">
            Essai gratuit 30 jours · Sans engagement · Sans carte bancaire
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="rounded-xl bg-white px-8 py-4 text-base font-bold text-cyan-700 transition hover:bg-gray-100"
            >
              Démarrer l&apos;essai gratuit
            </Link>
            <Link
              href="/pricing"
              className="text-base font-semibold text-white underline underline-offset-4 transition hover:text-cyan-100"
            >
              Voir le détail des modules →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
