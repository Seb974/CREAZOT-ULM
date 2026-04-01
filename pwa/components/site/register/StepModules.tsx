"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import type { RegistrationData } from "./RegisterStepper";

interface ModulePack {
  id: number;
  name: string;
  description?: string;
  isDefault?: boolean;
  modules?: { name: string }[];
}

interface ModulePackPrice {
  id: number;
  modulePack: { id: number } | string;
  pricingCategory: { id: number } | string;
  monthlyPrice: number;
}

interface PricingCategory {
  id: number;
  name: string;
  slug?: string;
  isDefault?: boolean;
}

interface PricingTier {
  id: number;
  pricingCategory: { id: number } | string;
  minAeronefs: number;
  maxAeronefs: number | null;
  pricePerAeronef: number;
}

interface StepModulesProps {
  selectedPackIds: number[];
  nbAeronefs: number;
  onChange: (values: Partial<RegistrationData["modules"]>) => void;
}

const FALLBACK_PACKS: ModulePack[] = [
  { id: -1, name: "Pack Base", description: "Tableau de bord, passagers, réservations de base", isDefault: true },
  { id: -2, name: "Pack Vol", description: "Carnets de vols, horamètres, statistiques" },
  { id: -3, name: "Pack Maintenance", description: "Flotte, butées entretien, alertes, changement moteur" },
  { id: -4, name: "Pack Pilote", description: "Profils, qualifications, certificats médicaux, alertes" },
  { id: -5, name: "Pack Prépaiements", description: "Bons cadeaux, synchro Wix, PDF" },
];

function extractId(ref: { id: number } | string | number): number {
  if (typeof ref === "number") return ref;
  if (typeof ref === "object" && ref !== null && "id" in ref) return ref.id;
  if (typeof ref === "string") {
    const match = ref.match(/\/(\d+)$/);
    return match ? parseInt(match[1], 10) : 0;
  }
  return 0;
}

export default function StepModules({
  selectedPackIds,
  nbAeronefs,
  onChange,
}: StepModulesProps) {
  const [packs, setPacks] = useState<ModulePack[]>([]);
  const [prices, setPrices] = useState<ModulePackPrice[]>([]);
  const [categories, setCategories] = useState<PricingCategory[]>([]);
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const base = window.origin;

    const safeFetch = (url: string) =>
      fetch(url, { headers: { Accept: "application/ld+json" } }).then((r) => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json();
      });

    Promise.all([
      safeFetch(`${base}/module-packs?pagination=false`),
      safeFetch(`${base}/module-pack-prices?pagination=false`),
      safeFetch(`${base}/pricing-categories?pagination=false`),
      safeFetch(`${base}/pricing-tiers?pagination=false`),
    ])
      .then(([packsRes, pricesRes, categoriesRes, tiersRes]) => {
        const toArray = <T,>(res: any): T[] => {
          const data = res?.["hydra:member"] ?? res;
          return Array.isArray(data) ? data : [];
        };

        const packsData = toArray<ModulePack>(packsRes);
        const pricesData = toArray<ModulePackPrice>(pricesRes);
        const catsData = toArray<PricingCategory>(categoriesRes);
        const tiersData = toArray<PricingTier>(tiersRes);

        setPacks(packsData);
        setPrices(pricesData);
        setCategories(catsData);
        setTiers(tiersData);

        const defaultPack = packsData.find((p) => p.isDefault);
        if (defaultPack && !selectedPackIds.includes(defaultPack.id)) {
          onChange({ packIds: [...selectedPackIds, defaultPack.id] });
        }
      })
      .catch(() => {
        setPacks(FALLBACK_PACKS);
        setError("Données de tarification indisponibles — affichage indicatif");
        const fb = FALLBACK_PACKS.find((p) => p.isDefault);
        if (fb && !selectedPackIds.includes(fb.id)) {
          onChange({ packIds: [...selectedPackIds, fb.id] });
        }
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const defaultCategory =
    categories.find((c) => c.isDefault) ||
    categories.find((c) => c.slug === "public") ||
    categories[0];

  const getPackPrice = (packId: number): number => {
    if (!defaultCategory) return 0;
    const mp = prices.find(
      (p) =>
        extractId(p.modulePack) === packId &&
        extractId(p.pricingCategory) === defaultCategory.id
    );
    return mp ? mp.monthlyPrice : 0;
  };

  const getAeronefPrice = (): number => {
    if (!defaultCategory) return 0;
    const tier = tiers.find((t) => {
      if (extractId(t.pricingCategory) !== defaultCategory.id) return false;
      const aboveMin = nbAeronefs >= t.minAeronefs;
      const belowMax = t.maxAeronefs === null || nbAeronefs <= t.maxAeronefs;
      return aboveMin && belowMax;
    });
    return tier ? tier.pricePerAeronef : 0;
  };

  const togglePack = (packId: number) => {
    const pack = packs.find((p) => p.id === packId);
    if (pack?.isDefault) return;

    const ids = selectedPackIds.includes(packId)
      ? selectedPackIds.filter((id) => id !== packId)
      : [...selectedPackIds, packId];
    onChange({ packIds: ids });
  };

  const aeronefTotal = nbAeronefs * getAeronefPrice();
  const packsTotal = selectedPackIds.reduce((sum, id) => sum + getPackPrice(id), 0);
  const grandTotal = aeronefTotal + packsTotal;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <CircularProgress sx={{ color: "#0f929a" }} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {error && (
        <Alert severity="warning" sx={{ mb: 1 }}>{error}</Alert>
      )}
      <h2 className="text-title-xsm font-semibold text-black">
        Sélectionnez vos modules
      </h2>

      <div className="space-y-3">
        {packs.map((pack) => {
          const isSelected = selectedPackIds.includes(pack.id);
          const isDefault = !!pack.isDefault;
          const price = getPackPrice(pack.id);

          return (
            <Card
              key={pack.id}
              onClick={() => togglePack(pack.id)}
              sx={{
                cursor: isDefault ? "default" : "pointer",
                borderLeft: isSelected ? "4px solid #0f929a" : "4px solid transparent",
                bgcolor: isSelected ? "#f0fdfa" : "#fff",
                transition: "all 0.2s",
                "&:hover": isDefault ? {} : { boxShadow: 3 },
              }}
            >
              <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, py: 2 }}>
                <Checkbox
                  checked={isSelected}
                  disabled={isDefault}
                  sx={{
                    color: "#0f929a",
                    "&.Mui-checked": { color: "#0f929a" },
                    p: 0,
                  }}
                />

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-black">{pack.name}</span>
                    {isDefault && (
                      <Chip
                        label="INCLUS"
                        size="small"
                        sx={{
                          bgcolor: "#0f929a",
                          color: "#fff",
                          fontWeight: 600,
                          fontSize: "0.7rem",
                          height: 22,
                        }}
                      />
                    )}
                  </div>
                  {pack.description && (
                    <p className="mt-0.5 text-sm text-body">{pack.description}</p>
                  )}
                  {pack.modules && pack.modules.length > 0 && (
                    <p className="mt-0.5 text-xs text-bodydark2">
                      {pack.modules.map((m) => m.name).join(", ")}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  {isDefault ? (
                    <span className="text-sm font-medium text-success">Gratuit</span>
                  ) : (
                    <span className="text-sm font-semibold text-black">
                      {price.toFixed(2)} €<span className="text-xs text-body">/mois</span>
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 rounded-lg bg-cyan-200/30 p-5">
        <h3 className="mb-3 text-sm font-semibold text-black">
          Récapitulatif estimé
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-body">
              Aéronefs ({nbAeronefs} × {getAeronefPrice().toFixed(2)} €)
            </span>
            <span className="font-medium text-black">{aeronefTotal.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between">
            <span className="text-body">Modules sélectionnés</span>
            <span className="font-medium text-black">{packsTotal.toFixed(2)} €</span>
          </div>
          <div className="border-t border-stroke pt-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-black">Total estimé / mois</span>
              <span className="text-lg font-bold text-cyan-700">
                {grandTotal.toFixed(2)} €
              </span>
            </div>
          </div>
        </div>
        <div className="mt-3">
          <Chip
            label="Gratuit pendant 30 jours"
            sx={{
              bgcolor: "#d1fae5",
              color: "#065f46",
              fontWeight: 600,
              fontSize: "0.8rem",
            }}
          />
        </div>
      </div>
    </div>
  );
}
