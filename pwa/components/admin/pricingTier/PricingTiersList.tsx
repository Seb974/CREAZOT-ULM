import { useMemo, useCallback } from "react";
import { useGetList, useRedirect, Title, CreateButton } from "react-admin";
import {
  Box,
  Paper,
  Typography,
  Chip,
  Skeleton,
  Tooltip,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import BuildIcon from "@mui/icons-material/Build";

interface Category {
  id: number;
  "@id"?: string;
  name: string;
  discountPercent?: number;
  maintenanceDiscount?: number;
  isDefault?: boolean;
  isActive?: boolean;
}

interface Tier {
  id: number;
  "@id"?: string;
  pricingCategory: string;
  minAeronefs: number;
  maxAeronefs: number | null;
  pricePerAeronef: number;
}

const iri = (e: { "@id"?: string; id: number }, r: string) =>
  e["@id"] || `/${r}/${e.id}`;

export const PricingTiersList = () => {
  const redirect = useRedirect();

  const { data: categories, isLoading: loadingCats } = useGetList<Category>(
    "pricing-categories",
    { pagination: { page: 1, perPage: 100 }, sort: { field: "name", order: "ASC" } }
  );

  const { data: tiers, isLoading: loadingTiers } = useGetList<Tier>(
    "pricing-tiers",
    { pagination: { page: 1, perPage: 200 }, sort: { field: "minAeronefs", order: "ASC" } }
  );

  const activeCats = useMemo(
    () => (categories || []).filter((c) => c.isActive !== false),
    [categories]
  );

  const defaultCat = useMemo(
    () => activeCats.find((c) => c.isDefault) || activeCats[0],
    [activeCats]
  );

  const getTiers = useCallback(
    (catIri: string) =>
      (tiers || [])
        .filter((t) => t.pricingCategory === catIri)
        .sort((a, b) => a.minAeronefs - b.minAeronefs),
    [tiers]
  );

  const maxTierCount = useMemo(
    () =>
      Math.max(
        ...activeCats.map((c) => getTiers(iri(c, "pricing-categories")).length),
        0
      ),
    [activeCats, getTiers]
  );

  if (loadingCats || loadingTiers) {
    return (
      <Box p={2}>
        <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  return (
    <Box p={{ xs: 1.5, sm: 2, md: 3 }}>
      <Title title="Tranches tarifaires" />

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h6" fontWeight={700} color="#1e293b" fontSize={{ xs: "1.1rem", md: "1.25rem" }}>
            Prix par aéronef
          </Typography>
          <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
            Tarif dégressif par grille tarifaire
          </Typography>
        </Box>
        <CreateButton resource="pricing-tiers" />
      </Box>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 2.5,
          border: "1px solid #e2e8f0",
          overflow: "hidden",
        }}
      >
        <Box sx={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 420 }}>
            <thead>
              <tr style={{ backgroundColor: "#0f172a" }}>
                <th
                  style={{
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    padding: "12px 16px",
                    textAlign: "left",
                    whiteSpace: "nowrap",
                  }}
                >
                  Nombre d&apos;aéronefs
                </th>
                {activeCats.map((cat) => (
                  <th
                    key={cat.id}
                    style={{
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: "0.8rem",
                      padding: "12px 16px",
                      textAlign: "center",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {cat.name}
                    {cat.discountPercent ? (
                      <span
                        style={{
                          marginLeft: 6,
                          backgroundColor: "#22c55e",
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: "0.65rem",
                          padding: "2px 7px",
                          borderRadius: 20,
                        }}
                      >
                        -{cat.discountPercent}%
                      </span>
                    ) : null}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: maxTierCount }).map((_, idx) => {
                const refTier = defaultCat
                  ? getTiers(iri(defaultCat, "pricing-categories"))[idx]
                  : null;

                return (
                  <tr
                    key={idx}
                    style={{
                      backgroundColor: idx % 2 === 0 ? "#fff" : "#f8fafc",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f1f5f9")}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = idx % 2 === 0 ? "#fff" : "#f8fafc")
                    }
                  >
                    <td
                      style={{
                        fontWeight: 500,
                        color: "#334155",
                        padding: "14px 16px",
                        borderTop: "1px solid #f1f5f9",
                        fontSize: "0.9rem",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {refTier
                        ? refTier.maxAeronefs
                          ? `${refTier.minAeronefs} à ${refTier.maxAeronefs} aéronefs`
                          : `${refTier.minAeronefs}+ aéronefs`
                        : "—"}
                    </td>
                    {activeCats.map((cat) => {
                      const tier = getTiers(iri(cat, "pricing-categories"))[idx];
                      return (
                        <td
                          key={cat.id}
                          style={{
                            padding: "14px 16px",
                            borderTop: "1px solid #f1f5f9",
                            textAlign: "center",
                            whiteSpace: "nowrap",
                          }}
                          onClick={() => tier && redirect("edit", "pricing-tiers", tier.id)}
                        >
                          {tier ? (
                            <>
                              <span style={{ fontWeight: 700, fontSize: "1.4rem", color: "#0f172a" }}>
                                {tier.pricePerAeronef}
                              </span>
                              <span style={{ fontSize: "0.75rem", color: "#94a3b8", marginLeft: 3 }}>
                                €/mois
                              </span>
                            </>
                          ) : (
                            <span style={{ color: "#cbd5e1" }}>—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {activeCats.some((c) => c.maintenanceDiscount) && (
                <tr style={{ backgroundColor: "#fffbeb" }}>
                  <td
                    style={{
                      fontWeight: 600,
                      color: "#92400e",
                      padding: "12px 16px",
                      borderTop: "2px solid #fde68a",
                      fontSize: "0.85rem",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <BuildIcon sx={{ fontSize: 16, color: "#d97706" }} />
                      Aéronef en maintenance
                    </Box>
                  </td>
                  {activeCats.map((cat) => (
                    <td
                      key={cat.id}
                      style={{
                        padding: "12px 16px",
                        borderTop: "2px solid #fde68a",
                        textAlign: "center",
                      }}
                    >
                      {cat.maintenanceDiscount ? (
                        <span
                          style={{
                            backgroundColor: "#fef3c7",
                            color: "#92400e",
                            fontWeight: 700,
                            fontSize: "0.85rem",
                            padding: "4px 12px",
                            borderRadius: 20,
                            border: "1px solid #fde68a",
                          }}
                        >
                          -{cat.maintenanceDiscount}%
                        </span>
                      ) : (
                        <span style={{ color: "#cbd5e1" }}>—</span>
                      )}
                    </td>
                  ))}
                </tr>
              )}
            </tbody>
          </table>
        </Box>
      </Paper>
    </Box>
  );
};
