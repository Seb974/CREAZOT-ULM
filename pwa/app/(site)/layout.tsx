import { type ReactNode } from "react";
import SiteNavbar from "../../components/site/SiteNavbar";
import SiteFooter from "../../components/site/SiteFooter";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteNavbar />
      <main className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
