import React, { createContext, useContext, useEffect, useState } from 'react';

const SiteSettingsContext = createContext(null);

export const SiteSettingsProvider = ({ children }) => {
    const [siteSettings, setSiteSettings] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSiteSettings();
    }, []);

    const fetchSiteSettings = async () => {
        try {
            const res = await fetch("/site-settings?pagination=false", {
                method: "GET",
                headers: { Accept: "application/ld+json" }
            });
            const data = await res.json();
            const members = data['hydra:member'] || [];

            if (members.length > 0) {
                const settings = members[0];
                setSiteSettings(settings);
                sessionStorage.setItem("siteSettings", JSON.stringify(settings));
            }

            setLoading(false);
        } catch (e) {
            console.error("Erreur de récupération des paramètres du site", e);
            setLoading(false);
        }
    };

    const updateSiteSettings = (newSettings) => {
        setSiteSettings(newSettings);
        sessionStorage.setItem("siteSettings", JSON.stringify(newSettings));
    };

    return (
        <SiteSettingsContext.Provider value={{ siteSettings, loading, updateSiteSettings }}>
            { children }
        </SiteSettingsContext.Provider>
    );
};

export const useSiteSettings = () => useContext(SiteSettingsContext);
