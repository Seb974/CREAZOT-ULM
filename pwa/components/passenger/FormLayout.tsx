"use client";

import { Toaster } from "react-hot-toast";

interface FormLayoutProps {
    children: React.ReactNode;
    client?: {
        name?: string;
        logo?: string;
    };
}

export default function FormLayout({ children, client }: FormLayoutProps) {
    const clientName = client?.name || 'Gestion Aéronautique';

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
        </>
    );
  }