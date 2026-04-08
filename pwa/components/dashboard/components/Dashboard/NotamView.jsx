import React, { useEffect, useState } from 'react';
import { getNotams, analyzeNotamAi } from '../../../../app/lib/actions';
import { useSessionContext } from '../../../admin/SessionContextProvider';
import {
    CircularProgress, Chip, Box, Typography, Alert, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Divider
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import FlightIcon from '@mui/icons-material/Flight';
import BlockIcon from '@mui/icons-material/Block';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CloseIcon from '@mui/icons-material/Close';
import AssignmentIcon from '@mui/icons-material/Assignment';

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

const formatAnalysis = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
        const boldMatch = line.match(/^\*\*(.+?)\*\*\s*:?\s*(.*)/);
        const numMatch = line.match(/^(\d+)\.\s*\*\*(.+?)\*\*\s*:?\s*(.*)/);
        if (numMatch) {
            return (
                <Box key={i} sx={{ mb: 1.2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#7b1fa2', fontSize: '0.88rem' }}>
                        {numMatch[1]}. {numMatch[2]}
                    </Typography>
                    {numMatch[3] && (
                        <Typography variant="body2" sx={{ ml: 2.5, lineHeight: 1.6, fontSize: '0.85rem' }}>
                            {numMatch[3]}
                        </Typography>
                    )}
                </Box>
            );
        }
        if (boldMatch) {
            return (
                <Box key={i} sx={{ mb: 1.2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#7b1fa2', fontSize: '0.88rem' }}>
                        {boldMatch[1]}
                    </Typography>
                    {boldMatch[2] && (
                        <Typography variant="body2" sx={{ ml: 1, lineHeight: 1.6, fontSize: '0.85rem' }}>
                            {boldMatch[2]}
                        </Typography>
                    )}
                </Box>
            );
        }
        if (line.trim() === '') return <Box key={i} sx={{ height: 6 }} />;
        return (
            <Typography key={i} variant="body2" sx={{ lineHeight: 1.6, fontSize: '0.85rem', mb: 0.3 }}>
                {line}
            </Typography>
        );
    });
};

const NotamCard = ({ notam, index, icao, session, hasAI = false }) => {
    const [aiResult, setAiResult] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const typeInfo = getNotamType(notam);
    const raw = notam.raw || notam.body || notam.text || 'N/A';
    const start = notam.startDate || notam.start_time || notam.effective_start;
    const end = notam.endDate || notam.end_time || notam.effective_end;
    const id = notam.id || notam.number || `notam-${index}`;

    const handleAnalyze = async () => {
        setDialogOpen(true);
        if (aiResult) return;

        setAiLoading(true);
        setAiError(null);
        try {
            const data = await analyzeNotamAi(raw, icao, session);
            setAiResult(data.analysis);
        } catch (err) {
            const msg = err?.response?.data?.error || 'Erreur lors de l\'analyse IA.';
            setAiError(msg);
        } finally {
            setAiLoading(false);
        }
    };

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
                {hasAI && <Chip
                    icon={<AutoAwesomeIcon sx={{ fontSize: 14 }} />}
                    label="Interpréter"
                    size="small"
                    onClick={handleAnalyze}
                    sx={{
                        cursor: 'pointer',
                        backgroundColor: '#f3e5f5',
                        color: '#7b1fa2',
                        border: '1px solid #ce93d8',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        '&:hover': { backgroundColor: '#e1bee7' },
                    }}
                />}
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

            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        overflow: 'hidden',
                    }
                }}
            >
                <DialogTitle
                    sx={{
                        background: 'linear-gradient(135deg, #6a1b9a 0%, #ab47bc 100%)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        py: 2,
                        px: 3,
                    }}
                >
                    <AssignmentIcon sx={{ fontSize: 28 }} />
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.2 }}>
                            Interprétation NOTAM
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.85, fontSize: '0.78rem' }}>
                            {icao} — {id} — Analyse par Kimi K2.5
                        </Typography>
                    </Box>
                    <IconButton onClick={() => setDialogOpen(false)} sx={{ color: '#fff' }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ px: 3, py: 2.5, minHeight: 200 }}>
                    {aiLoading && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 6, gap: 2 }}>
                            <CircularProgress size={40} sx={{ color: '#7b1fa2' }} />
                            <Typography variant="body2" color="text.secondary">
                                Kimi analyse le NOTAM {id}...
                            </Typography>
                        </Box>
                    )}
                    {aiError && (
                        <Alert severity="error" sx={{ mt: 1 }}>
                            {aiError}
                        </Alert>
                    )}
                    {aiResult && !aiLoading && (
                        <>
                            <Box sx={{ mb: 2, p: 1.5, backgroundColor: '#f5f5f5', borderRadius: 1, border: '1px solid #e0e0e0' }}>
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
                                            fontSize: '0.65rem',
                                        }}
                                    />
                                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#757575', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                        NOTAM source
                                    </Typography>
                                    {start && (
                                        <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto', fontSize: '0.7rem' }}>
                                            {formatDate(start)} → {formatDate(end)}
                                        </Typography>
                                    )}
                                </Box>
                                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', mt: 0.5, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                                    {raw}
                                </Typography>
                            </Box>
                            <Divider sx={{ my: 2 }} />
                            <Box sx={{ mt: 1 }}>
                                {formatAnalysis(aiResult)}
                            </Box>
                        </>
                    )}
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 1.5, borderTop: '1px solid #e0e0e0' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
                        Généré par IA — À confirmer avec les sources officielles
                    </Typography>
                    <Button onClick={() => setDialogOpen(false)} sx={{ textTransform: 'none' }}>
                        Fermer
                    </Button>
                </DialogActions>
            </Dialog>

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
};

export const NotamView = ({ code, hasAI = false }) => {
    const { session } = useSessionContext();
    const [notams, setNotams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!code) return;
        setLoading(true);
        setError(null);
        getNotams(code, session)
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
            {notams.map((notam, i) => (
                <NotamCard key={notam.id || notam.number || i} notam={notam} index={i} icao={code} session={session} hasAI={hasAI} />
            ))}
        </Box>
    );
};
