"use client";

import { Toaster } from "react-hot-toast";

interface FormLayoutProps {
    children: React.ReactNode;
    client?: {
        name?: string;
        logo?: string;
        siteWeb?: string;
        couleurPrincipale?: string;
    };
}

export default function FormLayout({ children, client }: FormLayoutProps) {
    const clientName = client?.name || 'Planetair Gestion';
    const contactUrl = client?.siteWeb
        ? `${client.siteWeb.startsWith('http') ? '' : 'https://'}${client.siteWeb}/contact`
        : null;
    const siteUrl = client?.siteWeb
        ? `${client.siteWeb.startsWith('http') ? '' : 'https://'}${client.siteWeb}`
        : '#';

    return (  
        <>
            <Toaster position="top-right" />
            { client?.logo && (
                <div className="flex justify-center mt-4">
                    <img src={ client.logo } alt={ clientName } className="h-16 object-contain" />
                </div>
            )}
            <h1 className="main-title text-center text-3xl font-bold mt-4 top-0">FORMULAIRE VIGIPIRATE</h1>
            <div className="flex justify-center md:overflow-y-scroll z-50">
                <div className="flex-grow max-w-screen-sm p-6 md:overflow-y-auto md:p-12">
                    {children}
                </div>
            </div>
            <footer className="rounded-lg shadow m-4 bottom-0 sticky md:absolute">
                <div className="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between"> 
                <span className="text-sm sm:text-center">© { new Date().getFullYear() } <a href={ siteUrl } className="hover:underline">{ clientName }™</a>. All Rights Reserved.
                </span>
                 <ul className="flex flex-wrap items-center mt-3 text-sm font-medium sm:mt-0">
                    { contactUrl && (
                        <li>
                            <a href={ contactUrl } className="hover:underline me-4 md:me-6 discreet-link">Contactez-nous</a>
                        </li>
                    )}
                    <li>
                        <a href="/admin" className="hover:underline me-4 md:me-6 discreet-link">Accès licenciés</a>
                    </li>
                    <li>
                        <a href="/oidc/" className="hover:underline discreet-link">Administration</a>
                    </li>
                </ul>
                </div>
            </footer>
        </>
    );
  }