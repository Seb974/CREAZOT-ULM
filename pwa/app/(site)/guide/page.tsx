import Link from "next/link";
import { getSiteSettings } from "../../lib/getSiteSettings";

const guideModules = [
  {
    number: "01",
    name: "Tableau de Bord Opérationnel",
    icon: "🌤️",
    summary:
      "Votre centre de commandes quotidien : météo aéro temps réel, calendrier du jour, conditions de vol.",
    details: [
      "Consultez les METAR et TAF de vos terrains en un coup d'œil.",
      "Carte Windy intégrée avec couches vent, pluie, nuages.",
      "Radar Météo&Radar pour anticiper les perturbations.",
      "Caméras terrain en temps réel (si disponibles).",
      "Vue calendrier du jour : réservations, vols planifiés, alertes.",
    ],
  },
  {
    number: "02",
    name: "Réservations",
    icon: "📅",
    summary:
      "Gérez le cycle complet : du premier contact au vol effectué.",
    details: [
      "Créez une réservation en quelques clics (date, heure, appareil, pilote).",
      "Statuts automatiques : En attente → Confirmée → Effectuée → Archivée.",
      "Attribution automatique des pilotes selon disponibilités et qualifications.",
      "Vue planning hebdomadaire et mensuelle.",
      "Conversion automatique des bons cadeaux en réservation.",
    ],
  },
  {
    number: "03",
    name: "Prépaiements & Bons Cadeaux",
    icon: "🎁",
    summary:
      "Gérez vos bons cadeaux, synchronisez avec votre site Wix, générez des PDF.",
    details: [
      "Création de bons cadeaux avec montant, validité et code unique.",
      "Synchronisation automatique avec votre boutique Wix.",
      "Génération PDF du bon cadeau prêt à imprimer ou envoyer.",
      "Suivi de l'utilisation : montant restant, date d'expiration.",
      "Conversion en réservation en un clic.",
    ],
  },
  {
    number: "04",
    name: "Paiements",
    icon: "💳",
    summary:
      "CB, espèces, virement — tout est tracé et exportable.",
    details: [
      "Enregistrez les paiements par CB, espèces, virement ou chèque.",
      "Suivi des soldes : payé, restant dû, trop-perçu.",
      "Export comptable au format CSV pour votre expert-comptable.",
      "Historique complet des transactions par client.",
      "Rapprochement automatique avec les réservations.",
    ],
  },
  {
    number: "05",
    name: "Carnets de Vols",
    icon: "📓",
    summary:
      "Horamètres, durées, atterrissages — tout est automatisé.",
    details: [
      "Saisie rapide : horamètre départ/arrivée, durée calculée automatiquement.",
      "Mise à jour automatique des horamètres avion et moteur.",
      "Compteurs d'atterrissages pour le suivi réglementaire.",
      "Statistiques par pilote, par appareil, par période.",
      "Export du carnet de vol au format réglementaire.",
    ],
  },
  {
    number: "06",
    name: "Passagers",
    icon: "👤",
    summary:
      "Inscription publique conforme RGPD, fiche passager dématérialisée.",
    details: [
      "Formulaire d'inscription public accessible par QR code ou lien.",
      "Recueil du consentement RGPD avec signature électronique.",
      "Informations médicales et contact d'urgence sécurisés.",
      "Association automatique à la réservation du jour.",
      "Archivage automatique selon la politique de rétention.",
    ],
  },
  {
    number: "07",
    name: "Flotte & Maintenance",
    icon: "🔧",
    summary:
      "Horamètres, butées entretien, alertes visuelles, changement moteur.",
    details: [
      "Fiche appareil complète : immatriculation, type, motorisation, horamètre.",
      "Butées d'entretien configurables (heures, calendaire, atterrissages).",
      "Alertes visuelles : vert (OK), orange (approche), rouge (dépassé).",
      "Historique de maintenance complet et traçable.",
      "Gestion du changement moteur avec report de compteurs.",
    ],
  },
  {
    number: "08",
    name: "Pilotes",
    icon: "🧑‍✈️",
    summary:
      "Qualifications, certificats médicaux, heures de vol, alertes automatiques.",
    details: [
      "Profil pilote : licence, qualifications, restrictions.",
      "Suivi des certificats médicaux avec date d'expiration.",
      "Alertes automatiques J-30 et J-7 avant expiration.",
      "Compteur d'heures de vol et d'atterrissages par pilote.",
      "Vérification automatique des qualifications lors de l'attribution d'un vol.",
    ],
  },
  {
    number: "09",
    name: "Administration & Configuration",
    icon: "⚙️",
    summary:
      "Circuits, tarifs, partenaires — paramétrez tout depuis votre espace.",
    details: [
      "Configuration des circuits de vol (durée, tarif, description).",
      "Grilles tarifaires personnalisables par période.",
      "Gestion des partenaires et apporteurs d'affaires.",
      "Paramétrage des créneaux horaires et jours d'ouverture.",
      "Personnalisation du formulaire passager.",
    ],
  },
  {
    number: "10",
    name: "Sécurité & Authentification",
    icon: "🔐",
    summary:
      "SSO Keycloak, authentification multi-facteur, gestion des rôles.",
    details: [
      "Authentification SSO via Keycloak (OpenID Connect).",
      "Authentification multi-facteur (MFA) configurable.",
      "Rôles granulaires : Super Admin, Admin Club, Pilote, Accueil.",
      "Isolation complète des données entre clubs (multi-tenant).",
      "Journalisation des connexions et actions sensibles.",
    ],
  },
];

const quickStart = [
  {
    step: "1",
    title: "Créez votre compte",
    description: "Inscrivez votre club en 2 minutes. Essai gratuit 30 jours, sans carte bancaire.",
    link: "/register",
    linkLabel: "S'inscrire",
  },
  {
    step: "2",
    title: "Configurez votre club",
    description: "Ajoutez vos aéronefs, pilotes et circuits. L'assistant vous guide pas à pas.",
    link: null,
    linkLabel: null,
  },
  {
    step: "3",
    title: "Commencez à voler",
    description: "Créez votre première réservation, enregistrez un vol, accueillez vos passagers.",
    link: null,
    linkLabel: null,
  },
];

export default async function GuidePage() {
  const siteSettings = await getSiteSettings();
  return (
    <div className="font-sans">
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-cyan-900 pb-20 pt-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-cyan-400">
            Documentation
          </p>
          <h1 className="text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            Guide Utilisateur
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-300">
            Tout ce qu&apos;il faut savoir pour exploiter {siteSettings.name}
            au maximum de ses capacités.
          </p>
        </div>
      </section>

      {/* ── Navigation rapide ── */}
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl overflow-x-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="shrink-0 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Accès rapide
            </span>
            <span className="text-gray-200">|</span>
            {guideModules.map((m) => (
              <a
                key={m.number}
                href={`#module-${m.number}`}
                className="shrink-0 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 no-underline transition-colors hover:border-cyan-500 hover:text-cyan-700"
              >
                {m.number}. {m.name}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Démarrage rapide ── */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Démarrage rapide</h2>
            <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-cyan-500" />
            <p className="mt-4 text-gray-500">
              Trois étapes pour être opérationnel.
            </p>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {quickStart.map((s) => (
              <div
                key={s.step}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-700 text-sm font-bold text-white">
                  {s.step}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {s.description}
                </p>
                {s.link && (
                  <Link
                    href={s.link}
                    className="mt-4 inline-block text-sm font-medium text-cyan-700 no-underline hover:underline"
                  >
                    {s.linkLabel} →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Modules détaillés ── */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Les 10 modules en détail
            </h2>
            <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-cyan-500" />
          </div>

          <div className="mt-16 space-y-16">
            {guideModules.map((m, idx) => (
              <article
                key={m.number}
                id={`module-${m.number}`}
                className="scroll-mt-24"
              >
                <div
                  className={`flex flex-col gap-8 md:flex-row ${
                    idx % 2 !== 0 ? "md:flex-row-reverse" : ""
                  }`}
                >
                  {/* Left: text */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-100 text-xl">
                        {m.icon}
                      </span>
                      <p className="text-xs font-medium uppercase tracking-wider text-cyan-700">
                        Module {m.number}
                      </p>
                    </div>

                    <h3 className="mt-4 text-2xl font-bold text-gray-900">
                      {m.name}
                    </h3>
                    <p className="mt-2 text-base leading-relaxed text-gray-600">
                      {m.summary}
                    </p>

                    <ul className="mt-6 space-y-3">
                      {m.details.map((d, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <svg
                            className="mt-0.5 h-5 w-5 shrink-0 text-cyan-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span className="text-sm leading-relaxed text-gray-700">
                            {d}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Right: visual placeholder */}
                  <div className="flex flex-1 items-center justify-center">
                    <div className="flex h-56 w-full items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 md:h-72">
                      <div className="text-center">
                        <span className="text-5xl">{m.icon}</span>
                        <p className="mt-2 text-xs text-gray-400">
                          Capture d&apos;écran à venir
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ rapide ── */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Questions fréquentes</h2>
            <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-cyan-500" />
          </div>

          <div className="mt-12 space-y-4">
            {[
              {
                q: "Combien de temps dure l'essai gratuit ?",
                a: "L'essai gratuit dure 30 jours. Aucune carte bancaire n'est requise. Vous conservez toutes vos données si vous passez à un forfait payant.",
              },
              {
                q: "Puis-je ajouter des modules après l'inscription ?",
                a: "Oui, vous pouvez ajouter ou retirer des modules à tout moment depuis votre espace d'administration.",
              },
              {
                q: "Mes données sont-elles sécurisées ?",
                a: "Absolument. Hébergement européen, chiffrement TLS, authentification SSO Keycloak avec MFA, isolation multi-tenant complète.",
              },
              {
                q: `${siteSettings.name} fonctionne-t-il sur mobile ?`,
                a: `Oui, ${siteSettings.name} est une Progressive Web App (PWA). Elle s'installe comme une application native sur iOS et Android.`,
              },
              {
                q: "Comment contacter le support ?",
                a: `Par email à ${siteSettings.email} ou via la page Contact. Réponse garantie sous 24h ouvrées.`,
              },
            ].map((faq) => (
              <details
                key={faq.q}
                className="group rounded-xl border border-gray-200 bg-white"
              >
                <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-base font-medium text-gray-900 [&::-webkit-details-marker]:hidden">
                  {faq.q}
                  <svg
                    className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-open:rotate-180"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </summary>
                <div className="border-t border-gray-100 px-6 py-4">
                  <p className="text-sm leading-relaxed text-gray-600">
                    {faq.a}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-gradient-to-r from-cyan-600 via-cyan-700 to-teal-800 py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white">
            Besoin d&apos;aide supplémentaire ?
          </h2>
          <p className="mt-4 text-lg text-cyan-100">
            Notre équipe est là pour vous accompagner.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="rounded-xl bg-white px-8 py-4 text-base font-bold text-cyan-700 no-underline transition hover:bg-gray-100"
            >
              Contacter le support
            </Link>
            <Link
              href="/register"
              className="text-base font-semibold text-white no-underline underline-offset-4 transition hover:underline"
            >
              Essai gratuit →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
