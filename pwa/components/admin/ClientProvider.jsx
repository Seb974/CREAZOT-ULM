import React, { createContext, useContext, useEffect, useState } from 'react';

const ClientContext = createContext(null);

export const ClientProvider = ({ children }) => {

    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const storedClient = sessionStorage.getItem('client');
        try {
            const parsedClient = JSON.parse(storedClient);
            if (parsedClient && typeof parsedClient === 'object' && parsedClient.id) {
                setClient(parsedClient);
                setLoading(false);
                return;
            }
        } catch (e) {
            console.warn("Données client corrompues dans sessionStorage", e);
        }
        fetchClientData();
    }, []);

    const fetchClientData = async () => {
        try {
            const res = await fetch("/clients?page=1&itemsPerPage=1&order[id]=asc", {
                method: "GET",
                headers: { "Content-Type": "application/json"}
            });
            const data = await res.json();
            setClient(data['hydra:member'][0]);
            sessionStorage.setItem("client", JSON.stringify(data['hydra:member'][0]));
            setLoading(false);
        } catch (e) {
            console.error("Erreur de récupération client", e);
        }
    };

    const updateClient = (newClient) => {
        setClient(newClient);
        sessionStorage.setItem("client", JSON.stringify(newClient));
    };

    return (
        <ClientContext.Provider value={{ client, loading, error, updateClient }}>
            { children }
        </ClientContext.Provider>
    );
};

export const useClient = () => useContext(ClientContext);
