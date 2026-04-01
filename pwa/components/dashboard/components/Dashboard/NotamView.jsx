import React, { useEffect, useState } from 'react';
import { getNotams } from '../../../../app/lib/actions';
import { CircularProgress, Chip, Box, Typography, Alert } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import FlightIcon from '@mui/icons-material/Flight';
import BlockIcon from '@mui/icons-material/Block';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AcUnitIcon from '@mui/icons-material/AcUnit';

const NOTAM_TYPE_CONFIG = {
    'A': { label: 'Aérodrome', color: '#1976d2', icon: <FlightIcon sx={{ fontSize: 14 }} /> },
    'E': { label: 'Espace aérien', color: '#ed6c02', icon: <WarningAmberIcon sx={{ fontSize: 14 }} /> },
    'W': { label: 'Navigation', color: '#9c27b0', icon: <InfoOutlinedIcon sx={{ fontSize: 14 }} /> },
    'R': { label: 'Restriction', color: '#d32f2f', icon: <BlockIcon sx={{ fontSize: 14 }} /> },
};

const getNotamType = (notam) => {
    const raw = (notam.raw || notam.body || '').toUpperCase();
    if (raw.includes('SNOW') || raw.includes('SNOWTAM'))
        return { label: 'SNOWTAM', color: '#0288d1', icon: <AcUnitIcon sx={{ fontSize: 14 }} /> };
    const qCode = notam.qualifiers?.subject || notam.type || '';
    return NOTAM_TYPE_CONFIG[qCode] || { label: 'Info', color: '#757575', icon: <InfoOutlinedIcon sx={{ fontSize: 14 }} /> };
};

const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return dateStr; }
};

export const NotamView = ({ code }) => {
    const [notams, setNotams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!code) return;
        setLoading(true);
        setError(null);
        getNotams(code)
            .then((data) => {
                const list = Array.isArray(data) ? data : (data?.data || []);
                setNotams(list);
            })
            .catch(() => setError('Impossible de charger les NOTAMs.'))
            .finally(() => setLoading(false));
    }, [code]);

    if (loading) {
        return (
            <div className="flex justify-center items-center w-full h-full min-h-[200px]">
                <CircularProgress color="error" size={50} />
            </div>
        );
    }

    if (error) {
        return <Alert severity="error" sx={{ m: 1 }}>{error}</Alert>;
    }

    if (notams.length === 0) {
        return (
            <Alert severity="success" icon={<FlightIcon />} sx={{ m: 1 }}>
                Aucun NOTAM actif pour <strong>{code}</strong>
            </Alert>
        );
    }

    return (
        <Box sx={{ maxHeight: 500, overflowY: 'auto', pr: 0.5 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                {notams.length} NOTAM{notams.length > 1 ? 's' : ''} actif{notams.length > 1 ? 's' : ''} pour <strong>{code}</strong>
            </Typography>
            {notams.map((notam, i) => {
                const typeInfo = getNotamType(notam);
                const raw = notam.raw || notam.body || notam.text || 'N/A';
                const start = notam.startDate || notam.start_time || notam.effective_start;
                const end = notam.endDate || notam.end_time || notam.effective_end;
                const id = notam.id || notam.number || `notam-${i}`;

                return (
                    <Box
                        key={id}
                        sx={{
                            mb: 1.5,
                            p: 1.5,
                            borderRadius: 1,
                            border: '1px solid #e0e0e0',
                            backgroundColor: '#fafafa',
                            '&:hover': { backgroundColor: '#f5f5f5' },
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Chip
                                icon={typeInfo.icon}
                                label={typeInfo.label}
                                size="small"
                                sx={{
                                    backgroundColor: `${typeInfo.color}15`,
                                    color: typeInfo.color,
                                    border: `1px solid ${typeInfo.color}40`,
                                    fontWeight: 600,
                                    fontSize: '0.7rem',
                                }}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                                {id}
                            </Typography>
                        </Box>
                        <Typography
                            variant="body2"
                            sx={{
                                fontFamily: 'monospace',
                                fontSize: '0.78rem',
                                lineHeight: 1.5,
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                                my: 1,
                            }}
                        >
                            {raw}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <Typography variant="caption" color="text.secondary">
                                Du {formatDate(start)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Au {formatDate(end)}
                            </Typography>
                        </Box>
                    </Box>
                );
            })}
        </Box>
    );
};
