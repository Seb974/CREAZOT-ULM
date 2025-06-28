"use client";

import { isDefined } from "../../app/lib/utils";
import { Layout } from "../common/Layout";
import { Toaster } from "react-hot-toast";

export default function FormLayout({client, children}) {
    return (  
        <>
            <Toaster position="top-right" />
            <h1 className="main-title text-center text-3xl font-bold mt-4 top-0">{ isDefined(client) && isDefined(client.thanksTitle) ? client.thanksTitle : "FORMULAIRE D'ENREGISTREMENT" }</h1>
            <Layout>
                <div className="flex justify-center md:overflow-y-scroll z-50">
                    <div className="flex-grow max-w-screen-sm p-6 md:overflow-y-auto md:p-12">
                        {children}
                    </div>
                </div>
            </Layout>
            <footer className=" rounded-lg shadow m-4 bottom-0 sticky md:absolute">
                <div className="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between"> 
                    <span className="text-sm sm:text-center">© { new Date().getFullYear() } 
                        { isDefined(client) && isDefined(client.website) && isDefined(client.name) ? 
                            <a href={ client.website } className="hover:underline">{`${ client.name }™`}</a> :
                            isDefined(client) && isDefined(client.name) ? `${ client.name }™.` : '.'
                        } 
                        All Rights Reserved.
                    </span>
                    <ul className="flex flex-wrap items-center mt-3 text-sm font-medium sm:mt-0">
                        { isDefined(client) && isDefined(client.email) &&
                            <li>
                                <a href={`mailto:${ client.email }`} className="hover:underline me-4 md:me-6 discreet-link">Contactez-nous</a>
                            </li>
                        }
                        <li>
                            <a href={`${ client?.url ?? window.location.origin }/admin`} className="hover:underline me-4 md:me-6 discreet-link">Accès licenciés</a>
                        </li>
                        <li>
                            <a href={`${ client?.url ?? window.location.origin }/oidc/`} className="hover:underline discreet-link">Administration</a>
                        </li>
                    </ul>
                </div>
            </footer>
        </>
    );
  }