import type { Metadata, Viewport } from "next";
import { type ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import "@fontsource/poppins";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";

import { Layout } from "../components/common/Layout";
import "../styles/globals.css";
import { Providers } from "./providers";
import { auth } from "./auth";
import { getSiteSettings } from "./lib/getSiteSettings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: `${settings.name} — Gestion Aéronautique`,
    description: 'La plateforme tout-en-un pour les clubs ULM et aéroclubs.',
    manifest: '/manifest.json',
    icons: {
      icon: settings.favicon || '/favicon.ico',
      apple: settings.appleTouchIcon || '/apple-touch-icon.png',
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: `${settings.name} Gestion`,
    },
  };
}
 
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  interactiveWidget: 'resizes-visual',
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  return (
    <html lang="fr">
      <body>
        <SessionProvider session={session} basePath='/api/auth'>
          <Providers>
            <Layout>
              {children}
            </Layout>
          </Providers>
        </SessionProvider>
      </body>
    </html>
  );
};
