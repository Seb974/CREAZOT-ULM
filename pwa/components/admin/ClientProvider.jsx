import React, { createContext, useContext, useEffect, useState } from 'react';
import { useDataProvider, DataProviderContext } from "react-admin";

const ClientContext = createContext(null);

export const ClientProvider = ({ children }) => {

    const dataProvider = useContext(DataProviderContext);
    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!dataProvider) return;
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
    }, [dataProvider]);

    const fetchClientData = async () => {
        try {
            setLoading(true);
            dataProvider
                .getList('clients',{pagination: { page: 1, perPage: 1 }, sort: { field: 'id', order: 'ASC' }})
                .then(({ data }) => {
                    setClient(data[0]);
                    sessionStorage.setItem('client', JSON.stringify(data[0]));
                    setLoading(false);
                });
        } catch (error) {
            setError('Erreur lors du chargement des données du client');
            setLoading(false);
        }
    };

    return (
        <ClientContext.Provider value={{ client, loading, error }}>
            { children }
        </ClientContext.Provider>
    );
};

export const useClient = () => useContext(ClientContext);
