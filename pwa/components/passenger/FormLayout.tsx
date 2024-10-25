import { Layout } from "../common/Layout";
import { Toaster } from "react-hot-toast";

export default function FormLayout({children}: { children: React.ReactNode }) {
    return (  
        <>
            <Toaster position="top-right" />
            <h1 className="main-title text-center text-3xl font-bold mt-4">FORMULAIRE VIGIPIRATE</h1>
            <Layout>
                <div className="flex justify-center">
                    <div className="flex-grow max-w-screen-sm p-6 md:overflow-y-auto md:p-12">
                        {children}
                    </div>
                </div>
            </Layout>
            <footer className=" rounded-lg shadow m-4 "> {/* bg-white dark:bg-gray-50 */}
                <div className="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between"> 
                <span className="text-sm sm:text-center">© { new Date().getFullYear() } <a href="https://planetair974.fr/" className="hover:underline">Planetair974™</a>. All Rights Reserved.  {/* text-gray-500 dark:text-gray-400 */}
                </span>
                 <ul className="flex flex-wrap items-center mt-3 text-sm font-medium sm:mt-0">      {/* text-gray-500 dark:text-gray-400 */}
                    <li>
                        <a href="https://localhost/docs" className="hover:underline me-4 md:me-6">API</a>
                    </li>
                    <li>
                        <a href="https://localhost/.well-known/mercure/ui/" className="hover:underline me-4 md:me-6">Mercure</a>
                    </li>
                    <li>
                        <a href="https://www.planetair974.fr/contact" className="hover:underline me-4 md:me-6 discreet-link">Contactez-nous</a>
                    </li>
                    <li>
                        <a href="https://localhost/admin" className="hover:underline me-4 md:me-6 discreet-link">Accès licenciés</a>
                    </li>
                    <li>
                        <a href="https://localhost/oidc/" className="hover:underline discreet-link">Administration</a>
                    </li>
                </ul>
                </div>
            </footer>
        </>
    );
  }