import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, Paper, Chip, CircularProgress, Alert, IconButton,
    Divider, Tooltip, LinearProgress,
    Button, List as MuiList, ListItem, ListItemIcon, ListItemText,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import CancelIcon from '@mui/icons-material/Cancel';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import AirIcon from '@mui/icons-material/Air';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloudIcon from '@mui/icons-material/Cloud';
import ArticleIcon from '@mui/icons-material/Article';
import SaveIcon from '@mui/icons-material/Save';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useSession } from 'next-auth/react';
import { getScoreOps, saveScoreOps } from '../../../../app/lib/actions';

const STATUS_CONFIG = {
    go: {
        label: 'GO',
        color: '#2e7d32',
        bgColor: '#e8f5e9',
        borderColor: '#4caf50',
        icon: CheckCircleIcon,
        gradient: 'linear-gradient(135deg, #43a047 0%, #2e7d32 100%)',
    },
    limite: {
        label: 'SELON EXPÉRIENCE',
        color: '#e65100',
        bgColor: '#fff3e0',
        borderColor: '#ff9800',
        icon: WarningIcon,
        gradient: 'linear-gradient(135deg, #fb8c00 0%, #e65100 100%)',
    },
    nogo: {
        label: 'NO GO',
        color: '#c62828',
        bgColor: '#ffebee',
        borderColor: '#f44336',
        icon: CancelIcon,
        gradient: 'linear-gradient(135deg, #ef5350 0%, #c62828 100%)',
    },
};

const CHECK_ICONS = {
    'Vent soutenu': AirIcon,
    'Rafales': AirIcon,
    'Vent traversier': AirIcon,
    'Visibilité': VisibilityIcon,
    'Plafond': CloudIcon,
    'NOTAM actifs': ArticleIcon,
};

const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.go;
    const Icon = cfg.icon;
    return (
        <Box sx={{
            background: cfg.gradient,
            borderRadius: 3,
            p: 3,
            textAlign: 'center',
            color: 'white',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        }}>
            <Icon sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: 2 }}>
                {cfg.label}
            </Typography>
        </Box>
    );
};

const CheckItem = ({ check }) => {
    const cfg = STATUS_CONFIG[check.status] || STATUS_CONFIG.go;
    const Icon = CHECK_ICONS[check.label] || InfoOutlinedIcon;
    return (
        <ListItem sx={{ py: 0.5, px: 1 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
                <Icon sx={{ color: cfg.color, fontSize: 20 }} />
            </ListItemIcon>
            <ListItemText
                primary={check.label}
                secondary={check.detail}
                primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                secondaryTypographyProps={{ variant: 'caption' }}
            />
            <Chip
                label={cfg.label}
                size="small"
                sx={{
                    backgroundColor: cfg.bgColor,
                    color: cfg.color,
                    border: `1px solid ${cfg.borderColor}`,
                    fontWeight: 700,
                    fontSize: '0.65rem',
                    height: 22,
                }}
            />
        </ListItem>
    );
};

const ScoreOpsWidget = ({ client }) => {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const mainAirport = client?.airports?.find(a => a.main) || client?.airports?.[0];
    const icao = mainAirport?.code;

    const fetchScore = useCallback(async () => {
        if (!icao || !session?.accessToken || !client?.id) return;
        setLoading(true);
        setError(null);
        setSaved(false);
        try {
            const data = await getScoreOps(icao, session, client.id);
            setResult(data);
        } catch (err) {
            setError(err?.response?.data?.error || "Erreur lors de l'analyse.");
        } finally {
            setLoading(false);
        }
    }, [icao, session, client?.id]);

    useEffect(() => {
        fetchScore();
    }, [fetchScore]);

    const handleSave = async () => {
        if (!result || !icao) return;
        setSaving(true);
        try {
            await saveScoreOps(icao, result, session, client.id);
            setSaved(true);
        } catch {
            setError('Erreur lors de la sauvegarde.');
        } finally {
            setSaving(false);
        }
    };

    if (!icao) {
        return (
            <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary">
                    Aucun aéroport configuré pour ce club.
                </Typography>
            </Paper>
        );
    }

    return (
        <Paper sx={{
            borderRadius: 2,
            overflow: 'hidden',
            border: result?.result ? `2px solid ${STATUS_CONFIG[result.result]?.borderColor || '#e0e0e0'}` : '1px solid #e0e0e0',
        }}>
            {/* Header */}
            <Box sx={{
                background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                color: 'white',
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                <Box display="flex" alignItems="center" gap={1}>
                    <FlightTakeoffIcon />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Avis CREAZOT
                    </Typography>
                </Box>
                <Box>
                    <Tooltip title="Rafraîchir l'analyse">
                        <IconButton onClick={fetchScore} sx={{ color: 'white' }} size="small">
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {loading && <LinearProgress />}

            <Box sx={{ p: 2 }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                )}

                {result?.result === 'no_rules' && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        {result.message}
                    </Alert>
                )}

                {result?.result === 'no_data' && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        {result.message}
                    </Alert>
                )}

                {result && !['no_rules', 'no_data'].includes(result.result) && (
                    <>
                        {/* Station info */}
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Chip
                                label={`Station: ${result.icao}`}
                                variant="outlined"
                                size="small"
                                sx={{ fontWeight: 600 }}
                            />
                            {result.rule_name && (
                                <Chip
                                    label={`Profil: ${result.rule_name}`}
                                    variant="outlined"
                                    size="small"
                                    color="primary"
                                />
                            )}
                        </Box>

                        {/* Main verdict */}
                        <StatusBadge status={result.result} />

                        {/* Detail checks */}
                        {result.checks?.length > 0 && (
                            <Box mt={2}>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: '#666', mb: 1, display: 'block' }}>
                                    DÉTAIL DES PARAMÈTRES
                                </Typography>
                                <MuiList dense disablePadding>
                                    {result.checks.map((check, i) => (
                                        <CheckItem key={i} check={check} />
                                    ))}
                                </MuiList>
                            </Box>
                        )}

                        {/* METAR raw */}
                        {result.metar_raw && (
                            <Box mt={2}>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: '#666' }}>
                                    METAR
                                </Typography>
                                <Typography variant="body2" sx={{
                                    fontFamily: 'monospace',
                                    fontSize: '0.75rem',
                                    backgroundColor: '#f5f5f5',
                                    p: 1,
                                    borderRadius: 1,
                                    mt: 0.5,
                                    wordBreak: 'break-all',
                                }}>
                                    {result.metar_raw}
                                </Typography>
                            </Box>
                        )}

                        <Divider sx={{ my: 2 }} />

                        {/* Actions */}
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Button
                                startIcon={saving ? <CircularProgress size={14} /> : <SaveIcon />}
                                onClick={handleSave}
                                disabled={saving || saved}
                                size="small"
                                variant={saved ? "outlined" : "contained"}
                                color={saved ? "success" : "primary"}
                            >
                                {saved ? 'Enregistré' : 'Sauvegarder'}
                            </Button>
                        </Box>

                        {/* Disclaimer */}
                        <Alert severity="warning" sx={{ mt: 2, '& .MuiAlert-message': { fontSize: '0.7rem' } }}>
                            {result.disclaimer || "Cet outil fournit une aide à la décision basée sur les paramètres définis par l'exploitant. Le commandant de bord reste seul décisionnaire."}
                        </Alert>
                    </>
                )}

                {!result && !loading && !error && (
                    <Box textAlign="center" py={3}>
                        <CircularProgress size={30} />
                        <Typography variant="body2" color="text.secondary" mt={1}>
                            Chargement de l'analyse...
                        </Typography>
                    </Box>
                )}
            </Box>
        </Paper>
    );
};

export default ScoreOpsWidget;
