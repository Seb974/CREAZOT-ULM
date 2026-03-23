import Link from "next/link";
import SiteNavbar from "../components/site/SiteNavbar";
import SiteFooter from "../components/site/SiteFooter";

const features = [
  {
    emoji: "🌤️",
    title: "Météo Aéronautique",
    description:
      "METAR & TAF temps réel, carte Windy, radar Météo&Radar, caméras terrain.",
  },
  {
    emoji: "📋",
    title: "Conformité Réglementaire",
    description:
      "Qualifications pilotes, certificats médicaux, validités. Alertes automatiques J-30 et J-7.",
  },
  {
    emoji: "🔧",
    title: "Maintenance Préventive",
    description:
      "Suivi horamètres, butées entretien et changement moteur. Alertes visuelles.",
  },
  {
    emoji: "📅",
    title: "Planning Intelligent",
    description:
      "Réservations, disponibilités pilotes, calendrier visuel. Conversion automatique des bons cadeaux.",
  },
  {
    emoji: "🏢",
    title: "Multi-Structure",
    description:
      "Un outil, plusieurs clubs. Données isolées, personnalisation complète par structure.",
  },
  {
    emoji: "🔐",
    title: "Sécurité & RGPD",
    description:
      "SSO Keycloak, authentification multi-facteur, hébergement Europe.",
  },
];

const modules = [
  { number: "01", name: "Tableau de Bord Opérationnel", description: "Météo, calendrier, conditions de vol" },
  { number: "02", name: "Réservations", description: "Cycle complet du premier contact au vol" },
  { number: "03", name: "Prépaiements & Bons Cadeaux", description: "Bons cadeaux, synchro Wix" },
  { number: "04", name: "Paiements", description: "CB, espèces, virement, export comptable" },
  { number: "05", name: "Carnets de Vols", description: "Horamètres, durées, atterrissages" },
  { number: "06", name: "Passagers", description: "Inscription publique, RGPD" },
  { number: "07", name: "Flotte & Maintenance", description: "Horamètres, butées, alertes" },
  { number: "08", name: "Pilotes", description: "Qualifications, certificats, heures de vol" },
  { number: "09", name: "Administration & Configuration", description: "Circuits, tarifs, partenaires" },
  { number: "10", name: "Sécurité & Authentification", description: "SSO Keycloak, MFA, rôles" },
];

const stats = [
  { value: "10", label: "Modules intégrés" },
  { value: "29", label: "Entités gérées" },
  { value: "100%", label: "Web & Mobile" },
];

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col font-sans">
      {/* ── Hero Section ── */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-cyan-900">
        <SiteNavbar />

        <div className="mx-auto max-w-7xl px-6 pb-24 pt-20 text-center">
          <p className="mb-6 inline-block rounded-full bg-cyan-700/20 px-4 py-1 text-sm font-medium uppercase tracking-widest text-cyan-200">
            Version 4.0
          </p>

          <h1 className="text-6xl font-bold leading-tight text-white md:text-7xl lg:text-8xl">
            C&nbsp;<span className="text-cyan-500">6</span>&nbsp;L
          </h1>
          <p className="mt-2 text-3xl font-light text-white md:text-4xl">
            Gestion Aéronautique
          </p>

          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-gray-300">
            La plateforme tout-en-un pour les clubs ULM et aéroclubs.
            Réservations, météo temps réel, maintenance, pilotes — simplifiez
            votre exploitation.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="rounded-xl bg-cyan-700 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-cyan-700/25 transition hover:bg-cyan-500"
            >
              Essai gratuit 30 jours
            </Link>
            <Link
              href="/admin"
              className="rounded-xl border border-gray-400 px-8 py-4 text-base font-semibold text-white transition hover:border-white hover:bg-white/5"
            >
              Connexion →
            </Link>
          </div>

          <div className="mx-auto mt-16 grid max-w-xl grid-cols-3 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="rounded-lg bg-white/5 px-4 py-5 backdrop-blur-sm">
                <p className="text-4xl font-bold text-white">{s.value}</p>
                <p className="mt-1 text-sm text-gray-400">{s.label}</p>
                <div className="mx-auto mt-3 h-0.5 w-8 rounded-full bg-cyan-500/40" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pourquoi C6L ── */}
      <section id="features" className="bg-gray-50 py-24 scroll-mt-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
              Pourquoi C<span className="text-cyan-700">6</span>L
            </h2>
            <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-cyan-500" />
            <p className="mt-4 text-xl font-light text-gray-700">
              Conçu pour l&apos;aéronautique.
              <br />
              Pensé pour le terrain.
            </p>
            <p className="mt-4 text-base text-gray-500">
              Chaque fonctionnalité a été développée avec des exploitants
              d&apos;aéroclubs et de bases ULM.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-gray-200 border-l-4 border-l-cyan-500 bg-white p-6 shadow-sm transition-all hover:scale-[1.02] hover:bg-cyan-50/50 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-100">
                  <span className="text-2xl">{f.emoji}</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 10 Modules ── */}
      <section id="modules" className="bg-gradient-to-br from-gray-800 to-gray-900 py-24 scroll-mt-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center text-3xl font-bold text-white md:text-4xl">
            10 modules intégrés
          </h2>
          <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-cyan-500" />

          <div className="mt-16 grid gap-4 md:grid-cols-2">
            {modules.map((m) => (
              <div
                key={m.number}
                className="rounded-lg border border-gray-600 border-l-2 border-l-cyan-700 bg-gray-800/50 p-4 transition-all hover:scale-[1.02] hover:border-cyan-500 hover:bg-gray-700/80"
              >
                <p className="text-xs font-medium uppercase tracking-wider text-cyan-400">
                  Module {m.number}
                </p>
                <p className="mt-1 font-semibold text-white">{m.name}</p>
                <p className="mt-1 text-sm text-gray-400">{m.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Final ── */}
      <section className="bg-gradient-to-r from-cyan-600 via-cyan-700 to-teal-800 py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Prêt à simplifier votre gestion ?
          </h2>
          <p className="mt-4 text-lg text-cyan-100">
            Essai gratuit 30 jours · Sans engagement · Sans carte bancaire
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="rounded-xl bg-white px-10 py-5 text-lg font-bold text-cyan-700 shadow-lg shadow-black/10 transition-all hover:scale-105 hover:bg-gray-100"
            >
              Démarrer l&apos;essai gratuit
            </Link>
            <Link
              href="/admin"
              className="text-base font-semibold text-white underline underline-offset-4 transition hover:text-cyan-100"
            >
              Connexion →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <SiteFooter />
    </div>
  );
}
