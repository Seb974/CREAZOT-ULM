import React, { useEffect, useState } from 'react';
import { getMetarOrTaf, briefMeteoAi } from '../../../../app/lib/actions'
import { useSessionContext } from '../../../admin/SessionContextProvider' 
import { isDefined } from '../../../../app/lib/utils';
import {
    CircularProgress, Alert, Box, Typography, Chip,
    Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton, Divider
} from '@mui/material';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CloseIcon from '@mui/icons-material/Close';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';

export const EncodedMetarTaf = ({ code, hasAI = false }) => {

    const { session } = useSessionContext();

    const [metar, setMetar] = useState(null);
    const [taf, setTaf] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [aiResult, setAiResult] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => {
        if (!code) return;
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                await fetchData();
            } catch {
                setError('Impossible de récupérer les données météo.');
            }
            setLoading(false);
        };
        load();
    }, [code]);

    const fetchData = async () => {
        const [metarRes, tafRes] = await Promise.all([
            getMetarOrTaf(code, 'metar', true, session).catch(() => null),
            getMetarOrTaf(code, 'taf', true, session).catch(() => null)
        ]);

        const m = metarRes?.data?.[0] || null;
        const t = tafRes?.data?.[0] || null;

        setMetar(m);
        setTaf(t);

        if (!m && !t) {
            setError('no_data');
        }
    };

    const handleBriefing = async () => {
        setDialogOpen(true);
        if (aiResult) return;

        setAiLoading(true);
        setAiError(null);
        try {
            const metarRaw = metar?.raw_text || '';
            const tafRaw = taf?.raw_text || '';
            const data = await briefMeteoAi(metarRaw, tafRaw, code, session);
            setAiResult(data.briefing);
        } catch (err) {
            const msg = err?.response?.data?.error || 'Erreur lors du briefing IA.';
            setAiError(msg);
        } finally {
            setAiLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center w-full h-full min-h-[200px]">
                <CircularProgress color="error" size={50} />
            </div>
        );
    }

    if (error && error !== 'no_data') {
        return (
            <Alert severity="error" icon={<CloudOffIcon />} sx={{ m: 1 }}>
                {error}
            </Alert>
        );
    }

    if (error === 'no_data') {
        return (
            <Alert severity="info" icon={<CloudOffIcon />} sx={{ m: 1 }}>
                Aucune donnée METAR/TAF disponible pour <strong>{code}</strong>. Cette station ne dispose peut-être pas de service météo automatique.
            </Alert>
        );
    }

    const hasData = (isDefined(metar) && metar.raw_text) || (isDefined(taf) && taf.raw_text);

    const formatBriefing = (text) => {
        if (!text) return null;
        return text.split('\n').map((line, i) => {
            const boldMatch = line.match(/^\*\*(.+?)\*\*\s*:?\s*(.*)/);
            const numMatch = line.match(/^(\d+)\.\s*\*\*(.+?)\*\*\s*:?\s*(.*)/);
            if (numMatch) {
                return (
                    <Box key={i} sx={{ mb: 1.2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#e65100', fontSize: '0.88rem' }}>
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
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#e65100', fontSize: '0.88rem' }}>
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

    return (
        <>
            {hasData && hasAI && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                    <Chip
                        icon={<AutoAwesomeIcon sx={{ fontSize: 16 }} />}
                        label="Briefing IA"
                        onClick={handleBriefing}
                        sx={{
                            cursor: 'pointer',
                            backgroundColor: '#fff3e0',
                            color: '#e65100',
                            border: '1px solid #ffcc80',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            '&:hover': { backgroundColor: '#ffe0b2' },
                        }}
                    />
                </Box>
            )}

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
                        background: 'linear-gradient(135deg, #e65100 0%, #ff8f00 100%)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        py: 2,
                        px: 3,
                    }}
                >
                    <FlightTakeoffIcon sx={{ fontSize: 28 }} />
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.2 }}>
                            Briefing Météo IA
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.85, fontSize: '0.78rem' }}>
                            {code} — Analyse par Kimi K2.5
                        </Typography>
                    </Box>
                    <IconButton onClick={() => setDialogOpen(false)} sx={{ color: '#fff' }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ px: 3, py: 2.5, minHeight: 200 }}>
                    {aiLoading && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 6, gap: 2 }}>
                            <CircularProgress size={40} sx={{ color: '#e65100' }} />
                            <Typography variant="body2" color="text.secondary">
                                Kimi analyse les données météo pour {code}...
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
                            {isDefined(metar) && metar.raw_text && (
                                <Box sx={{ mb: 2, p: 1.5, backgroundColor: '#f5f5f5', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#757575', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                        METAR source
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', mt: 0.5, wordBreak: 'break-word' }}>
                                        {metar.raw_text}
                                    </Typography>
                                </Box>
                            )}
                            {isDefined(taf) && taf.raw_text && (
                                <Box sx={{ mb: 2, p: 1.5, backgroundColor: '#f5f5f5', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#757575', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                        TAF source
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', mt: 0.5, wordBreak: 'break-word' }}>
                                        {taf.raw_text}
                                    </Typography>
                                </Box>
                            )}
                            <Divider sx={{ my: 2 }} />
                            <Box sx={{ mt: 1 }}>
                                {formatBriefing(aiResult)}
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

            <h3><b>METAR</b></h3>
            { isDefined(metar) && metar.raw_text ?
                <p>
                    { metar.observed &&
                        <i className="text-xs">
                            Le {new Date(metar.observed).toLocaleDateString()} à {new Date(metar.observed).toLocaleTimeString()}
                        </i>
                    }
                    <br/>
                    {metar.raw_text}
                </p>
                :
                <Alert severity="info" variant="outlined" sx={{ my: 1, py: 0.5 }}>
                    Aucun METAR disponible pour <strong>{code}</strong>
                </Alert>
            }
            <br/>
            <h3><b>TAF</b></h3>
            { isDefined(taf) && taf.raw_text ?
                <p>
                    { taf.timestamp &&
                        <i className="text-xs">
                            Du {new Date(taf.timestamp.from).toLocaleDateString()} {new Date(taf.timestamp.from).toLocaleTimeString()}{" "}
                            au {new Date(taf.timestamp.to).toLocaleDateString()} {new Date(taf.timestamp.to).toLocaleTimeString()}
                        </i>
                    }
                    <br/>
                    {taf.raw_text}
                </p>
                :
                <Alert severity="info" variant="outlined" sx={{ my: 1, py: 0.5 }}>
                    Aucun TAF disponible pour <strong>{code}</strong>
                </Alert>
            }
        </>
    );
};
