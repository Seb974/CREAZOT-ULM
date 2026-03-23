import React from 'react';
import { useRefresh, useSidebarState } from 'react-admin';
import { useClient } from './ClientProvider';
import { Select, MenuItem, Box, Typography, Divider } from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

const ClientSelector = () => {
    const { client, clients, switchClient } = useClient();
    const refresh = useRefresh();
    const [openSidebar] = useSidebarState();

    if (!clients || clients.length <= 1) return null;

    const isSuperAdmin = typeof window !== 'undefined' && 
        (() => { try { const s = JSON.parse(sessionStorage.getItem('internSession') || '{}'); return s?.roles?.includes('ROLE_SUPER_ADMIN'); } catch(e) { return false; } })();

    const handleChange = (event) => {
        const value = event.target.value;
        if (value === '__all__') {
            sessionStorage.removeItem('client');
            refresh();
        } else {
            switchClient(parseInt(value, 10));
            refresh();
        }
    };

    return (
        <Box sx={{ px: 1, py: 1.5, borderTop: '1px solid #e0e0e0', mt: 'auto' }}>
            { openSidebar && (
                <Typography variant="caption" color="text.secondary" sx={{ px: 1, mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <SwapHorizIcon sx={{ fontSize: 14 }} />
                    Client actif
                </Typography>
            )}
            <Select
                value={client?.id || ''}
                onChange={handleChange}
                size="small"
                fullWidth
                sx={{
                    fontSize: openSidebar ? '0.85rem' : '0.7rem',
                    '.MuiSelect-select': { py: 0.8 },
                }}
            >
                {isSuperAdmin && (
                    <MenuItem value="__all__">
                        <Typography sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Vue fédérale</Typography>
                    </MenuItem>
                )}
                {clients.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                        <Typography sx={{ fontSize: '0.85rem' }}>{c.name}</Typography>
                    </MenuItem>
                ))}
            </Select>
        </Box>
    );
};

export default ClientSelector;
