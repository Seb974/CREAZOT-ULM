import { type ReactNode } from "react";
import SiteNavbar from "../../components/site/SiteNavbar";
import SiteFooter from "../../components/site/SiteFooter";
import { getSiteSettings } from "../lib/getSiteSettings";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const siteSettings = await getSiteSettings();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteNavbar siteName={siteSettings.name} />
      <main className="flex-1">
        {children}
      </main>
      <SiteFooter siteName={siteSettings.name} email={siteSettings.email} />
    </div>
  );
}
