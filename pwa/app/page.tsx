import Link from "next/link";
import SiteNavbar from "../components/site/SiteNavbar";
import SiteFooter from "../components/site/SiteFooter";
import { getSiteSettings } from "./lib/getSiteSettings";

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

export default async function Page() {
  const siteSettings = await getSiteSettings();
  return (
    <div className="flex min-h-screen flex-col font-sans">
      {/* ── Hero Section ── */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-cyan-900">
        <SiteNavbar siteName={siteSettings.name} />

        {/* Aerial vehicles decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 1440 700"
            fill="none"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <style>{`
                @keyframes dashFlow {
                  to { stroke-dashoffset: -120; }
                }
                @keyframes floatBalloon {
                  0%, 100% { transform: translate(0, 0); }
                  50% { transform: translate(8px, -12px); }
                }
              `}</style>
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="glowSoft">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* ── Main flight path (airplane) ── */}
            <path
              d="M-50,520 C100,460 280,280 500,220 C720,160 900,130 1150,110 C1300,100 1450,60 1550,40"
              stroke="rgba(250,204,21,0.22)"
              strokeWidth="2.5"
              strokeDasharray="8 14"
              strokeLinecap="round"
              style={{ animation: 'dashFlow 16s linear infinite' }}
            />

            {/* Airplane — FlightRadar style, nose aligned with path tangent */}
            <g transform="translate(877, 140) rotate(82)" filter="url(#glow)">
              <path
                d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"
                fill="#facc15"
                opacity="0.85"
                transform="scale(2.2) translate(-11.5, -12)"
              />
            </g>

            {/* ── Hot air balloon — far left margin, floats gently ── */}
            <g transform="translate(60, 340)" filter="url(#glowSoft)" style={{ animation: 'floatBalloon 8s ease-in-out infinite' }}>
              {/* Envelope */}
              <ellipse cx="0" cy="0" rx="28" ry="36" fill="#f97316" opacity="0.65" />
              <ellipse cx="0" cy="0" rx="28" ry="36" stroke="rgba(251,146,60,0.55)" strokeWidth="1.5" fill="none" />
              {/* Horizontal bands */}
              <ellipse cx="0" cy="-12" rx="27" ry="6" stroke="rgba(234,88,12,0.3)" strokeWidth="0.8" fill="none" />
              <ellipse cx="0" cy="10" rx="26" ry="6" stroke="rgba(234,88,12,0.3)" strokeWidth="0.8" fill="none" />
              {/* Vertical stripes */}
              <path d="M-14,-33 C-14,0 -14,33 -14,36" stroke="rgba(255,255,255,0.20)" strokeWidth="1" />
              <path d="M0,-36 C0,0 0,33 0,36" stroke="rgba(255,255,255,0.20)" strokeWidth="1" />
              <path d="M14,-33 C14,0 14,33 14,36" stroke="rgba(255,255,255,0.20)" strokeWidth="1" />
              {/* Skirt */}
              <path d="M-10,34 L-7,44 L7,44 L10,34" stroke="rgba(251,146,60,0.5)" strokeWidth="1.2" fill="rgba(251,146,60,0.25)" />
              {/* Cables */}
              <line x1="-10" y1="34" x2="-8" y2="56" stroke="rgba(255,255,255,0.30)" strokeWidth="0.8" />
              <line x1="10" y1="34" x2="8" y2="56" stroke="rgba(255,255,255,0.30)" strokeWidth="0.8" />
              <line x1="-4" y1="44" x2="-4" y2="56" stroke="rgba(255,255,255,0.20)" strokeWidth="0.6" />
              <line x1="4" y1="44" x2="4" y2="56" stroke="rgba(255,255,255,0.20)" strokeWidth="0.6" />
              {/* Basket */}
              <rect x="-8" y="56" width="16" height="9" rx="2" stroke="rgba(255,255,255,0.35)" strokeWidth="1" fill="rgba(139,92,42,0.45)" />
              {/* Flame glow */}
              <ellipse cx="0" cy="47" rx="3" ry="4" fill="rgba(250,204,21,0.3)" />
            </g>

            {/* ── Helicopter — right side with its own trail ── */}
            <path
              d="M1500,600 C1380,520 1320,440 1280,380 C1240,320 1200,280 1100,250"
              stroke="rgba(103,232,249,0.14)"
              strokeWidth="2"
              strokeDasharray="6 18"
              strokeLinecap="round"
              style={{ animation: 'dashFlow 22s linear infinite' }}
            />

            <g transform="translate(1280, 378)" filter="url(#glowSoft)">
              {/* Main rotor disc */}
              <ellipse cx="0" cy="-10" rx="26" ry="26" stroke="rgba(103,232,249,0.30)" strokeWidth="1" fill="none" strokeDasharray="4 6" />
              {/* Main rotor blades */}
              <line x1="-24" y1="-10" x2="24" y2="-10" stroke="rgba(103,232,249,0.55)" strokeWidth="2" strokeLinecap="round" />
              <line x1="0" y1="-34" x2="0" y2="14" stroke="rgba(103,232,249,0.55)" strokeWidth="2" strokeLinecap="round" />
              {/* Rotor hub */}
              <circle cx="0" cy="-10" r="3" fill="#67e8f9" opacity="0.50" />
              {/* Cabin / fuselage */}
              <path d="M-8,-4 C-10,2 -8,10 -4,12 L4,12 C8,10 10,2 8,-4 Z" fill="#67e8f9" opacity="0.50" />
              {/* Windshield */}
              <path d="M-5,-2 C-5,2 -3,6 0,7 C3,6 5,2 5,-2 Z" fill="rgba(103,232,249,0.25)" />
              {/* Tail boom */}
              <line x1="0" y1="12" x2="0" y2="34" stroke="#67e8f9" strokeWidth="2" opacity="0.45" strokeLinecap="round" />
              {/* Tail rotor */}
              <line x1="-6" y1="34" x2="6" y2="34" stroke="rgba(103,232,249,0.55)" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="0" cy="34" r="1.5" fill="#67e8f9" opacity="0.40" />
              {/* Tail fin */}
              <path d="M0,30 L4,34 L0,38" stroke="#67e8f9" strokeWidth="1.2" opacity="0.40" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              {/* Skids */}
              <line x1="-10" y1="14" x2="-10" y2="18" stroke="#67e8f9" strokeWidth="1.2" opacity="0.35" strokeLinecap="round" />
              <line x1="10" y1="14" x2="10" y2="18" stroke="#67e8f9" strokeWidth="1.2" opacity="0.35" strokeLinecap="round" />
              <line x1="-14" y1="18" x2="-6" y2="18" stroke="#67e8f9" strokeWidth="1.5" opacity="0.40" strokeLinecap="round" />
              <line x1="6" y1="18" x2="14" y2="18" stroke="#67e8f9" strokeWidth="1.5" opacity="0.40" strokeLinecap="round" />
            </g>

            {/* Distant small airplane (depth) */}
            <g transform="translate(1380, 65) rotate(88)">
              <path
                d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"
                fill="#67e8f9"
                opacity="0.18"
                transform="scale(1) translate(-11.5, -12)"
              />
            </g>
          </svg>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-20 text-center">
          <p className="mb-6 inline-block rounded-full bg-cyan-700/20 px-4 py-1 text-sm font-medium uppercase tracking-widest text-cyan-200">
            Version 4.0
          </p>

          <h1 className="text-6xl font-bold leading-tight text-white md:text-7xl lg:text-8xl">
            {siteSettings.name}
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
              Pourquoi {siteSettings.name}
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
      <SiteFooter siteName={siteSettings.name} email={siteSettings.email} />
    </div>
  );
}
