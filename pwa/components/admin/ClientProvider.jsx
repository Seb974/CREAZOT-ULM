import React, { createContext, useContext, useEffect, useState } from 'react';

const ClientContext = createContext(null);

export const ClientProvider = ({ children }) => {
    const [client, setClient] = useState(null);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const storedClient = sessionStorage.getItem('client');
        try {
            const parsedClient = JSON.parse(storedClient);
            if (parsedClient && typeof parsedClient === 'object' && parsedClient.id) {
                setClient(parsedClient);
            }
        } catch (e) {}
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const res = await fetch("/clients?pagination=false", {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });
            const data = await res.json();
            const memberList = data['hydra:member'] || [];
            setClients(memberList);
            if (!sessionStorage.getItem('client') && memberList.length > 0) {
                setClient(memberList[0]);
                sessionStorage.setItem("client", JSON.stringify(memberList[0]));
            }
            setLoading(false);
        } catch (e) {
            console.error("Erreur de récupération clients", e);
            setLoading(false);
        }
    };

    const updateClient = (newClient) => {
        setClient(newClient);
        sessionStorage.setItem("client", JSON.stringify(newClient));
    };

    const switchClient = (clientId) => {
        const found = clients.find(c => c.id === clientId);
        if (found) {
            updateClient(found);
            window.location.reload();
        }
    };

    return (
        <ClientContext.Provider value={{ client, clients, loading, error, updateClient, switchClient }}>
            { children }
        </ClientContext.Provider>
    );
};

export const useClient = () => useContext(ClientContext);
