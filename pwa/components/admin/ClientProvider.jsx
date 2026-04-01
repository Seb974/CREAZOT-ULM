import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

const ClientContext = createContext(null);

const decodeJwt = (token) => {
    try {
        const payload = token.split('.')[1];
        return JSON.parse(decodeURIComponent(
            atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
                .split('').map(c => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`).join('')
        ));
    } catch (e) { return null; }
};

export const ClientProvider = ({ children }) => {
    const { data: session, status } = useSession();
    const [client, setClient] = useState(null);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedClient = sessionStorage.getItem('client');
        try {
            const parsedClient = JSON.parse(storedClient);
            if (parsedClient && typeof parsedClient === 'object' && parsedClient.id) {
                setClient(parsedClient);
            }
        } catch (e) {}
    }, []);

    useEffect(() => {
        if (status !== 'authenticated' || !session?.accessToken) return;
        fetchClients();
    }, [status, session?.accessToken]);

    const fetchClients = async () => {
        try {
            const token = session.accessToken;
            const decoded = decodeJwt(token);
            const roles = decoded?.realm_access?.roles || [];
            const isSuperAdmin = roles.includes('super_admin') || roles.includes('ROLE_SUPER_ADMIN');
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/ld+json',
            };

            let memberList = [];

            if (isSuperAdmin) {
                const res = await fetch('/clients?pagination=false', { headers });
                const data = await res.json();
                memberList = data['hydra:member'] || [];
            } else {
                const email = decoded?.email || session.user?.email;
                if (email) {
                    const res = await fetch(`/users?email=${encodeURIComponent(email)}`, { headers });
                    const data = await res.json();
                    const users = data['hydra:member'] || [];
                    if (users.length > 0) {
                        memberList = users[0].clients || [];
                    }
                }
            }

            setClients(memberList);

            const storedRaw = sessionStorage.getItem('client');
            if (storedRaw) {
                try {
                    const parsed = JSON.parse(storedRaw);
                    const stillValid = memberList.find(c => c.id === parsed?.id);
                    if (stillValid) {
                        setClient(stillValid);
                    } else if (memberList.length > 0) {
                        setClient(memberList[0]);
                        sessionStorage.setItem('client', JSON.stringify(memberList[0]));
                    } else {
                        sessionStorage.removeItem('client');
                        setClient(null);
                    }
                } catch (e) {
                    sessionStorage.removeItem('client');
                }
            } else if (memberList.length > 0) {
                setClient(memberList[0]);
                sessionStorage.setItem('client', JSON.stringify(memberList[0]));
            }

            setLoading(false);
        } catch (e) {
            console.error('Erreur de récupération clients', e);
            setLoading(false);
        }
    };

    const updateClient = (newClient) => {
        setClient(newClient);
        sessionStorage.setItem('client', JSON.stringify(newClient));
    };

    const switchClient = (clientId) => {
        const found = clients.find(c => c.id === clientId);
        if (found) {
            updateClient(found);
        }
    };

    return (
        <ClientContext.Provider value={{ client, clients, loading, updateClient, switchClient }}>
            { children }
        </ClientContext.Provider>
    );
};

export const useClient = () => useContext(ClientContext);
