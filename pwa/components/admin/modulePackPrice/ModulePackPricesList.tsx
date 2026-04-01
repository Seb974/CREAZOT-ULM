import { useMemo, useCallback } from "react";
import { useGetList, useRedirect, Title, CreateButton } from "react-admin";
import {
  Box,
  Paper,
  Typography,
  Skeleton,
} from "@mui/material";

interface Category {
  id: number;
  "@id"?: string;
  name: string;
  discountPercent?: number;
  isDefault?: boolean;
  isActive?: boolean;
}

interface Pack {
  id: number;
  "@id"?: string;
  name: string;
  description?: string;
  isDefault?: boolean;
  sortOrder?: number;
}

interface PackPrice {
  id: number;
  "@id"?: string;
  modulePack: string;
  pricingCategory: string;
  monthlyPrice: number;
}

const iri = (e: { "@id"?: string; id: number }, r: string) =>
  e["@id"] || `/${r}/${e.id}`;

export const ModulePackPricesList = () => {
  const redirect = useRedirect();

  const { data: categories, isLoading: loadingCats } = useGetList<Category>(
    "pricing-categories",
    { pagination: { page: 1, perPage: 100 }, sort: { field: "name", order: "ASC" } }
  );

  const { data: packs, isLoading: loadingPacks } = useGetList<Pack>(
    "module-packs",
    { pagination: { page: 1, perPage: 100 }, sort: { field: "sortOrder", order: "ASC" } }
  );

  const { data: prices, isLoading: loadingPrices } = useGetList<PackPrice>(
    "module-pack-prices",
    { pagination: { page: 1, perPage: 500 } }
  );

  const activeCats = useMemo(
    () => (categories || []).filter((c) => c.isActive !== false),
    [categories]
  );

  const getPrice = useCallback(
    (packIri: string, catIri: string) =>
      (prices || []).find(
        (p) => p.modulePack === packIri && p.pricingCategory === catIri
      ),
    [prices]
  );

  if (loadingCats || loadingPacks || loadingPrices) {
    return (
      <Box p={2}>
        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  return (
    <Box p={{ xs: 1.5, sm: 2, md: 3 }}>
      <Title title="Tarifs des packs" />

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h6" fontWeight={700} color="#1e293b" fontSize={{ xs: "1.1rem", md: "1.25rem" }}>
            Packs de modules
          </Typography>
          <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
            Prix mensuel par grille tarifaire
          </Typography>
        </Box>
        <CreateButton resource="module-pack-prices" />
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
                  Pack
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
              {(packs || []).map((pack, idx) => {
                const packIri = iri(pack, "module-packs");
                const isIncluded = pack.isDefault;

                return (
                  <tr
                    key={pack.id}
                    style={{
                      backgroundColor: isIncluded
                        ? "#ecfeff"
                        : idx % 2 === 0
                          ? "#fff"
                          : "#f8fafc",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = isIncluded ? "#cffafe" : "#f1f5f9")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = isIncluded
                        ? "#ecfeff"
                        : idx % 2 === 0
                          ? "#fff"
                          : "#f8fafc")
                    }
                  >
                    <td
                      style={{
                        padding: "12px 16px",
                        borderTop: "1px solid #f1f5f9",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "#1e293b" }}>
                        {pack.name}
                      </span>
                      {isIncluded && (
                        <span
                          style={{
                            marginLeft: 8,
                            backgroundColor: "#0e7490",
                            color: "#fff",
                            fontWeight: 600,
                            fontSize: "0.6rem",
                            padding: "2px 7px",
                            borderRadius: 20,
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                            verticalAlign: "middle",
                          }}
                        >
                          Inclus
                        </span>
                      )}
                    </td>

                    {activeCats.map((cat) => {
                      const catIri = iri(cat, "pricing-categories");
                      const price = getPrice(packIri, catIri);

                      return (
                        <td
                          key={cat.id}
                          style={{
                            padding: "12px 16px",
                            borderTop: "1px solid #f1f5f9",
                            textAlign: "center",
                            whiteSpace: "nowrap",
                          }}
                          onClick={() =>
                            price
                              ? redirect("edit", "module-pack-prices", price.id)
                              : redirect("create", "module-pack-prices")
                          }
                        >
                          {price ? (
                            price.monthlyPrice === 0 ? (
                              <span style={{ fontWeight: 600, color: "#0e7490", fontSize: "0.9rem" }}>
                                Inclus
                              </span>
                            ) : (
                              <>
                                <span style={{ fontWeight: 700, fontSize: "1.4rem", color: "#0f172a" }}>
                                  {price.monthlyPrice}
                                </span>
                                <span style={{ fontSize: "0.75rem", color: "#94a3b8", marginLeft: 3 }}>
                                  €/mois
                                </span>
                              </>
                            )
                          ) : (
                            <span style={{ color: "#cbd5e1" }}>—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Box>
      </Paper>
    </Box>
  );
};
