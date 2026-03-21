import React from 'react';
import { useRefresh } from 'react-admin';
import { useClient } from './ClientProvider';
import { Select, MenuItem, Box, Typography } from '@mui/material';

const ClientSelector = () => {
    const { client, clients, switchClient } = useClient();
    const refresh = useRefresh();

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
        <Box sx={{ display: 'flex', alignItems: 'center', mx: 2 }}>
            <Select
                value={client?.id || ''}
                onChange={handleChange}
                size="small"
                sx={{
                    color: 'white',
                    '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.6)' },
                    '.MuiSvgIcon-root': { color: 'white' },
                    minWidth: 180,
                }}
            >
                {isSuperAdmin && (
                    <MenuItem value="__all__">
                        <Typography sx={{ fontWeight: 'bold' }}>Vue fédérale</Typography>
                    </MenuItem>
                )}
                {clients.map((c) => (
                    <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                ))}
            </Select>
        </Box>
    );
};

export default ClientSelector;
