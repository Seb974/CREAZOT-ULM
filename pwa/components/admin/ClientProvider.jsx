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
    const [clientRole, setClientRole] = useState(null);
    const [roleMap, setRoleMap] = useState({});

    useEffect(() => {
        const storedClient = sessionStorage.getItem('client');
        try {
            const parsedClient = JSON.parse(storedClient);
            if (parsedClient && typeof parsedClient === 'object' && parsedClient.id) {
                setClient(parsedClient);
            }
        } catch (e) {}

        const storedRole = sessionStorage.getItem('clientRole');
        if (storedRole) setClientRole(storedRole);
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
            let ucrEntries = [];

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
                        const userId = users[0]['@id']?.split('/').pop() || users[0].id;
                        const userClients = users[0].clients || [];
                        const clientIds = userClients.map(c => {
                            if (typeof c === 'string') return c.split('/').pop();
                            return c.id || c['@id']?.split('/').pop();
                        }).filter(Boolean);

                        if (clientIds.length > 0) {
                            const params = clientIds.map(id => `id[]=${id}`).join('&');
                            const fullRes = await fetch(`/clients?${params}&pagination=false`, { headers });
                            const fullData = await fullRes.json();
                            memberList = fullData['hydra:member'] || [];
                        }

                        const ucrRes = await fetch(
                            `/user_client_roles?user=/users/${userId}&pagination=false`,
                            { headers }
                        );
                        const ucrData = await ucrRes.json();
                        ucrEntries = ucrData['hydra:member'] || [];
                    }
                }
            }

            const newRoleMap = {};
            ucrEntries.forEach(ucr => {
                const cId = typeof ucr.client === 'string'
                    ? ucr.client.split('/').pop()
                    : (ucr.client?.id || ucr.client?.['@id']?.split('/').pop());
                if (cId) newRoleMap[String(cId)] = ucr.role;
            });
            setRoleMap(newRoleMap);

            setClients(memberList);

            const storedRaw = sessionStorage.getItem('client');
            let selectedClient = null;

            if (storedRaw) {
                try {
                    const parsed = JSON.parse(storedRaw);
                    const stillValid = memberList.find(c => c.id === parsed?.id);
                    if (stillValid) {
                        selectedClient = stillValid;
                    } else if (memberList.length > 0) {
                        selectedClient = memberList[0];
                    } else {
                        sessionStorage.removeItem('client');
                        sessionStorage.removeItem('clientRole');
                    }
                } catch (e) {
                    sessionStorage.removeItem('client');
                    sessionStorage.removeItem('clientRole');
                }
            } else if (memberList.length > 0) {
                selectedClient = memberList[0];
            }

            if (selectedClient) {
                setClient(selectedClient);
                sessionStorage.setItem('client', JSON.stringify(selectedClient));

                const resolvedRole = isSuperAdmin
                    ? 'super_admin'
                    : (newRoleMap[String(selectedClient.id)] || 'pilot');
                setClientRole(resolvedRole);
                sessionStorage.setItem('clientRole', resolvedRole);
            } else {
                setClient(null);
                setClientRole(null);
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

        const token = session?.accessToken;
        const decoded = token ? decodeJwt(token) : null;
        const roles = decoded?.realm_access?.roles || [];
        const isSuperAdmin = roles.includes('super_admin') || roles.includes('ROLE_SUPER_ADMIN');

        const resolvedRole = isSuperAdmin
            ? 'super_admin'
            : (roleMap[String(newClient.id)] || 'pilot');
        setClientRole(resolvedRole);
        sessionStorage.setItem('clientRole', resolvedRole);
    };

    const switchClient = (clientId) => {
        const found = clients.find(c => c.id === clientId);
        if (found) {
            updateClient(found);
        }
    };

    const isSuperAdmin = clientRole === 'super_admin';
    const isAdmin = clientRole === 'admin' || isSuperAdmin;

    return (
        <ClientContext.Provider value={{
            client, clients, loading,
            clientRole, isAdmin, isSuperAdmin,
            updateClient, switchClient
        }}>
            { children }
        </ClientContext.Provider>
    );
};

export const useClient = () => useContext(ClientContext);
