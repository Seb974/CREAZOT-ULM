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

export const metadata: Metadata = {
  title: 'Planetair974 - Administration',
  visualViewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
}
 
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  // userScalable: false,
  // Also supported but less commonly used
  interactiveWidget: 'resizes-visual',
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  return (
    <html lang="en">
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
