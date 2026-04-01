"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";

const API = typeof window !== "undefined" ? window.origin : (process.env.NEXT_PUBLIC_ENTRYPOINT || "");
const H = { Accept: "application/ld+json" };

interface Category { id: number; "@id"?: string; name: string; slug: string; discountPercent?: number; maintenanceDiscount?: number; isDefault?: boolean; }
interface Tier { id: number; pricingCategory: string; minAeronefs: number; maxAeronefs: number | null; pricePerAeronef: number; }
interface Pack { id: number; "@id"?: string; name: string; slug: string; description?: string; isDefault?: boolean; }
interface PackPrice { id: number; modulePack: string; pricingCategory: string; monthlyPrice: number; }

const iri = (e: { "@id"?: string; id: number }, r: string) => e["@id"] || `/${r}/${e.id}`;

export default function PricingPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [packs, setPacks] = useState<Pack[]>([]);
  const [prices, setPrices] = useState<PackPrice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/pricing-categories?pagination=false`, { headers: H }),
      axios.get(`${API}/pricing-tiers?pagination=false&order[minAeronefs]=asc`, { headers: H }),
      axios.get(`${API}/module-packs?pagination=false`, { headers: H }),
      axios.get(`${API}/module-pack-prices?pagination=false`, { headers: H }),
    ]).then(([c, t, p, pp]) => {
      setCategories(c.data["hydra:member"] || []);
      setTiers(t.data["hydra:member"] || []);
      setPacks(p.data["hydra:member"] || []);
      setPrices(pp.data["hydra:member"] || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const getTiers = (catIri: string) =>
    tiers.filter((t) => t.pricingCategory === catIri).sort((a, b) => a.minAeronefs - b.minAeronefs);

  const getPrice = (packIri: string, catIri: string) =>
    prices.find((p) => p.modulePack === packIri && p.pricingCategory === catIri);

  const defaultCat = categories.find((c) => c.isDefault) || categories[0];
  const maxTierCount = Math.max(...categories.map((c) => getTiers(iri(c, "pricing-categories")).length), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="font-sans">
      {/* Hero */}
      <section className="bg-gradient-to-b from-gray-950 to-gray-900 pb-20 pt-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-cyan-500">Tarification</p>
          <h1 className="text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            Tarifs simples, transparents
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-400">
            Choisissez les modules dont vous avez besoin.<br />
            Payez uniquement ce que vous utilisez.
          </p>
        </div>
      </section>

      {/* Prix par aéronef */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">Prix par aéronef</h2>
            <p className="mt-4 text-base text-gray-500">
              Un tarif dégressif selon la taille de votre flotte.
              Plus vous avez d&apos;aéronefs, moins vous payez par appareil.
            </p>
          </div>

          {/* Grille tarifaire en tableau */}
          <div className="mt-14 overflow-hidden rounded-xl border border-gray-200 shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-900 text-white">
                  <th className="px-6 py-4 text-left text-sm font-semibold">Nombre d&apos;aéronefs</th>
                  {categories.map((cat) => (
                    <th key={cat.id} className="px-6 py-4 text-center text-sm font-semibold">
                      {cat.name}
                      {cat.discountPercent ? (
                        <span className="ml-2 rounded-full bg-green-500 px-2.5 py-0.5 text-xs font-bold text-white">
                          -{cat.discountPercent}%
                        </span>
                      ) : null}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: maxTierCount }).map((_, idx) => {
                  const refTier = defaultCat ? getTiers(iri(defaultCat, "pricing-categories"))[idx] : null;
                  return (
                    <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="border-t border-gray-100 px-6 py-4 font-medium text-gray-700">
                        {refTier
                          ? refTier.maxAeronefs
                            ? `${refTier.minAeronefs} à ${refTier.maxAeronefs} aéronefs`
                            : `${refTier.minAeronefs}+ aéronefs`
                          : "—"}
                      </td>
                      {categories.map((cat) => {
                        const tier = getTiers(iri(cat, "pricing-categories"))[idx];
                        return (
                          <td key={cat.id} className="border-t border-gray-100 px-6 py-4 text-center">
                            {tier ? (
                              <>
                                <span className="text-2xl font-bold text-gray-900">{tier.pricePerAeronef}</span>
                                <span className="text-sm text-gray-400"> €/mois</span>
                              </>
                            ) : "—"}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}

                {categories.some((c) => c.maintenanceDiscount) && (
                  <tr className="bg-amber-50">
                    <td className="border-t border-amber-200 px-6 py-3 font-medium text-amber-800">
                      Aéronef en maintenance
                    </td>
                    {categories.map((cat) => (
                      <td key={cat.id} className="border-t border-amber-200 px-6 py-3 text-center">
                        {cat.maintenanceDiscount ? (
                          <span className="rounded-full bg-amber-200 px-3 py-1 text-sm font-semibold text-amber-800">
                            -{cat.maintenanceDiscount}%
                          </span>
                        ) : "—"}
                      </td>
                    ))}
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Packs de modules */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">Packs de modules</h2>
            <p className="mt-4 text-base text-gray-500">
              Composez votre offre à la carte.
              Le Pack Base est inclus pour tous les clubs.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {packs.map((pack) => {
              const defaultPrice = defaultCat ? getPrice(iri(pack, "module-packs"), iri(defaultCat, "pricing-categories")) : null;
              const isIncluded = pack.isDefault || (defaultPrice?.monthlyPrice === 0);

              return (
                <div
                  key={pack.id}
                  className={`relative flex flex-col rounded-xl border p-6 shadow-sm transition-all hover:shadow-md ${
                    isIncluded ? "border-cyan-500 bg-cyan-200/20" : "border-gray-200 bg-white"
                  }`}
                >
                  {isIncluded && (
                    <span className="absolute -top-3 right-4 rounded-full bg-cyan-700 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                      Inclus
                    </span>
                  )}

                  <h3 className="text-lg font-bold text-gray-900">{pack.name}</h3>
                  {pack.description && (
                    <p className="mt-1 text-sm text-gray-500">{pack.description}</p>
                  )}

                  <div className="my-5 h-px bg-gray-200" />

                  {/* Prix par grille */}
                  <div className="flex-1 space-y-2">
                    {categories.map((cat) => {
                      const price = getPrice(iri(pack, "module-packs"), iri(cat, "pricing-categories"));
                      return (
                        <div key={cat.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">
                            {cat.name}
                            {cat.discountPercent ? ` (-${cat.discountPercent}%)` : ""}
                          </span>
                          {price ? (
                            price.monthlyPrice === 0 ? (
                              <span className="font-semibold text-cyan-700">Inclus</span>
                            ) : (
                              <span className="font-bold text-gray-900">{price.monthlyPrice} €<span className="font-normal text-gray-400">/mois</span></span>
                            )
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Simulateur */}
      <section className="bg-gray-100 py-20">
        <div className="mx-auto max-w-3xl px-6">
          <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
            <h2 className="text-center text-2xl font-bold text-gray-900">Exemple de tarif</h2>
            <p className="mt-2 text-center text-sm text-gray-500">
              {defaultCat ? `Grille « ${defaultCat.name} »` : ""} — 4 aéronefs dont 1 en maintenance
            </p>

            {defaultCat && (() => {
              const catIri = iri(defaultCat, "pricing-categories");
              const tierList = getTiers(catIri);
              const tier = tierList.find((t) => 4 >= t.minAeronefs && (t.maxAeronefs === null || 4 <= t.maxAeronefs));
              if (!tier) return null;

              const discount = defaultCat.maintenanceDiscount || 0;
              const activePrice = tier.pricePerAeronef * 3;
              const maintPrice = tier.pricePerAeronef * (1 - discount / 100);
              const aeronefTotal = activePrice + maintPrice;

              const packPrices = packs.map((p) => {
                const pp = getPrice(iri(p, "module-packs"), catIri);
                return { name: p.name, price: pp?.monthlyPrice ?? 0 };
              });
              const packsTotal = packPrices.reduce((s, p) => s + p.price, 0);
              const total = aeronefTotal + packsTotal;

              return (
                <div className="mt-8 space-y-3">
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                    <span className="text-sm text-gray-700">3 aéronefs actifs × {tier.pricePerAeronef} €</span>
                    <span className="font-semibold text-gray-900">{activePrice.toFixed(2)} €</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-amber-50 px-4 py-3">
                    <span className="text-sm text-amber-800">1 en maintenance × {tier.pricePerAeronef} € (-{discount}%)</span>
                    <span className="font-semibold text-amber-800">{maintPrice.toFixed(2)} €</span>
                  </div>

                  {packPrices.map((p) => (
                    <div key={p.name} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                      <span className="text-sm text-gray-700">{p.name}</span>
                      {p.price === 0 ? (
                        <span className="font-semibold text-cyan-700">Inclus</span>
                      ) : (
                        <span className="font-semibold text-gray-900">{p.price.toFixed(2)} €</span>
                      )}
                    </div>
                  ))}

                  <div className="h-px bg-gray-200" />

                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-base font-bold text-gray-900">Total mensuel</span>
                    <span className="text-2xl font-bold text-cyan-700">
                      {total.toFixed(2).replace(".", ",")} €
                      <span className="text-sm font-normal text-gray-500"> /mois</span>
                    </span>
                  </div>

                  <div className="rounded-lg bg-cyan-200/30 px-4 py-3 text-center">
                    <p className="text-sm font-medium text-cyan-700">
                      Essai gratuit 30 jours inclus — sans carte bancaire
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-cyan-700 to-cyan-800 py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl">Prêt à décoller ?</h2>
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
              href="/contact"
              className="text-base font-semibold text-white underline underline-offset-4 transition hover:text-cyan-100"
            >
              Nous contacter →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
