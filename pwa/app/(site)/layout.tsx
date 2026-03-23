import { type ReactNode } from "react";
import SiteNavbar from "../../components/site/SiteNavbar";
import SiteFooter from "../../components/site/SiteFooter";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteNavbar />
      <main className="min-h-screen">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
