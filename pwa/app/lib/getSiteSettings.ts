const API_URL = typeof window !== "undefined"
  ? window.origin
  : (process.env.NEXT_PUBLIC_ENTRYPOINT || "");

export interface SiteSettingsData {
  id?: number;
  name: string;
  url: string;
  email: string;
  phone?: string;
  address?: string;
  zipcode?: string;
  city?: string;
  logo?: string;
  favicon?: string;
  appleTouchIcon?: string;
}

const defaults: SiteSettingsData = {
  name: "Logic-Ciel",
  url: "https://logic-ciel.com",
  email: "contact@creazot.com",
};

export async function getSiteSettings(): Promise<SiteSettingsData> {
  try {
    const res = await fetch(`${API_URL}/site-settings?pagination=false`, {
      headers: { Accept: "application/ld+json" },
      next: { revalidate: 300 },
    });

    if (!res.ok) return defaults;

    const data = await res.json();
    const member = data["hydra:member"]?.[0];
    return member ? { ...defaults, ...member } : defaults;
  } catch {
    return defaults;
  }
}
