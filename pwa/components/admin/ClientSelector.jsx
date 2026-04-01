import React, { useState } from 'react';
import { useRefresh, useSidebarState } from 'react-admin';
import { useClient } from './ClientProvider';
import { useSessionContext } from './SessionContextProvider';
import { Select, MenuItem, Box, Typography, Tooltip, IconButton, Checkbox, FormControlLabel } from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

const ClientSelector = () => {
    const { client, clients, switchClient } = useClient();
    const { session } = useSessionContext();
    const refresh = useRefresh();
    const [openSidebar] = useSidebarState();
    const [showSuspended, setShowSuspended] = useState(false);

    if (!clients || clients.length <= 1) return null;

    const isSuperAdmin = session?.user?.roles?.some(r => r === 'super_admin' || r === 'ROLE_SUPER_ADMIN') ?? false;

    const visibleClients = isSuperAdmin
        ? showSuspended
            ? clients
            : clients.filter(c => c.active !== false && c.subscriptionStatus !== 'suspended')
        : clients.filter(c => c.active !== false && c.subscriptionStatus !== 'suspended');

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

    if (!openSidebar) {
        return (
            <Box sx={{ py: 1, borderTop: '1px solid #e0e0e0', mt: 'auto', display: 'flex', justifyContent: 'center' }}>
                <Tooltip title={client?.name || 'Changer de client'} placement="right">
                    <IconButton size="small" sx={{ color: 'text.secondary' }}>
                        <SwapHorizIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                </Tooltip>
            </Box>
        );
    }

    return (
        <Box sx={{ px: 1, py: 1.5, borderTop: '1px solid #e0e0e0', mt: 'auto' }}>
            <Typography variant="caption" color="text.secondary" sx={{ px: 1, mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <SwapHorizIcon sx={{ fontSize: 14 }} />
                Client actif
            </Typography>
            <Select
                value={client?.id || ''}
                onChange={handleChange}
                size="small"
                fullWidth
                sx={{
                    fontSize: '0.85rem',
                    '.MuiSelect-select': { py: 0.8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
                    maxWidth: '100%',
                }}
            >
                {isSuperAdmin && (
                    <MenuItem value="__all__">
                        <Typography sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Vue fédérale</Typography>
                    </MenuItem>
                )}
                {visibleClients.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                        <Typography sx={{ fontSize: '0.85rem' }}>
                            {c.name}
                            {isSuperAdmin && c.active === false && (
                                <span style={{ marginLeft: 6, fontSize: '0.7rem', color: '#ef4444', fontWeight: 600 }}>
                                    (suspendu)
                                </span>
                            )}
                        </Typography>
                    </MenuItem>
                ))}
            </Select>
            {isSuperAdmin && (
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={showSuspended}
                            onChange={(e) => setShowSuspended(e.target.checked)}
                            size="small"
                            sx={{ py: 0, '& .MuiSvgIcon-root': { fontSize: 16 } }}
                        />
                    }
                    label="Inclure suspendus"
                    sx={{ mt: 0.5, ml: 0, '& .MuiFormControlLabel-label': { fontSize: '0.7rem', color: 'text.secondary' } }}
                />
            )}
        </Box>
    );
};

export default ClientSelector;
