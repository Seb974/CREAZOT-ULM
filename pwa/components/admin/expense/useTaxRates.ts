import { useGetList } from "react-admin";
import { useClient } from "../../admin/ClientProvider";
import { useMemo } from "react";

interface TvaChoice {
  id: number;
  name: string;
}

export const useTaxRates = (): { choices: TvaChoice[]; defaultRate: number | undefined; isLoading: boolean } => {
  const { client } = useClient();

  const raw = client?.countryCode;
  const code = typeof raw === "object" && raw !== null ? raw.code : typeof raw === "string" && raw.length <= 10 ? raw : undefined;

  const { data, isLoading } = useGetList("tax_rates", {
    pagination: { page: 1, perPage: 100 },
    sort: { field: "rate", order: "DESC" },
    filter: code ? { "countryCode.code": code } : {},
  }, { enabled: !!code });

  const choices = useMemo<TvaChoice[]>(() => {
    if (!data || data.length === 0) return [];
    return [...data]
      .sort((a: any, b: any) => b.rate - a.rate)
      .map((tr: any) => ({
        id: tr.rate,
        name: `${(tr.rate * 100).toFixed(1).replace(".", ",")} % \u2014 ${tr.label}`,
      }));
  }, [data]);

  const defaultRate = choices.length > 0 ? choices[0].id : undefined;

  return { choices, defaultRate, isLoading };
};
