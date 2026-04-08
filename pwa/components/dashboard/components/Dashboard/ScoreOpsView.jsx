import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, Chip, CircularProgress, Alert, IconButton,
    Divider, Tooltip, LinearProgress,
    Button, List as MuiList, ListItem, ListItemIcon, ListItemText,
    Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import CancelIcon from '@mui/icons-material/Cancel';
import AirIcon from '@mui/icons-material/Air';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloudIcon from '@mui/icons-material/Cloud';
import ArticleIcon from '@mui/icons-material/Article';
import SaveIcon from '@mui/icons-material/Save';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CloseIcon from '@mui/icons-material/Close';
import BlockIcon from '@mui/icons-material/Block';
import InfoIcon from '@mui/icons-material/Info';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import { useSession } from 'next-auth/react';
import { useClient } from '../../../admin/ClientProvider';
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
        label: 'VIGILANCE',
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
    'Vent': AirIcon,
    'Vent soutenu': AirIcon,
    'Rafales': AirIcon,
    'Vent traversier': AirIcon,
    'Visibilité': VisibilityIcon,
    'Plafond': CloudIcon,
    'NOTAM actifs': ArticleIcon,
    'NOTAM': ArticleIcon,
    'Jour aéronautique': WbSunnyIcon,
    'Tendance TAF': TrendingDownIcon,
};

const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.go;
    const Icon = cfg.icon;
    return (
        <Box sx={{
            background: cfg.gradient,
            borderRadius: 2,
            p: 2.5,
            textAlign: 'center',
            color: 'white',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            mb: 2,
        }}>
            <Icon sx={{ fontSize: 40, mb: 0.5 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: 2 }}>
                {cfg.label}
            </Typography>
        </Box>
    );
};

const NotamDialog = ({ open, onClose, check }) => {
    const details = check?.notam_details;
    const blocking = details?.blocking || [];
    const attention = details?.attention || [];
    const informational = details?.informational || [];
    const cfg = STATUS_CONFIG[check?.status] || STATUS_CONFIG.go;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Box display="flex" alignItems="center" gap={1}>
                    <ArticleIcon sx={{ color: cfg.color }} />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Analyse NOTAM
                    </Typography>
                    <Chip
                        label={cfg.label}
                        size="small"
                        sx={{
                            backgroundColor: cfg.bgColor,
                            color: cfg.color,
                            border: `1px solid ${cfg.borderColor}`,
                            fontWeight: 700,
                            fontSize: '0.7rem',
                        }}
                    />
                </Box>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
                    {check?.detail}
                </Typography>

                {blocking.length > 0 && (
                    <Box mb={2}>
                        <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                            <BlockIcon sx={{ color: '#c62828', fontSize: 18 }} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#c62828' }}>
                                NOTAM bloquants ({blocking.length})
                            </Typography>
                        </Box>
                        {blocking.map((b, i) => (
                            <Box key={i} sx={{
                                p: 1.5, mb: 1, borderRadius: 1,
                                backgroundColor: '#ffebee', border: '1px solid #ffcdd2',
                            }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#c62828', fontSize: '0.8rem' }}>
                                    {b.id}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#b71c1c', fontSize: '0.75rem', mt: 0.5 }}>
                                    {b.reason}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                )}

                {attention.length > 0 && (
                    <Box mb={2}>
                        <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                            <ReportProblemIcon sx={{ color: '#e65100', fontSize: 18 }} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#e65100' }}>
                                NOTAM vigilance ({attention.length})
                            </Typography>
                        </Box>
                        {attention.map((a, i) => (
                            <Box key={i} sx={{
                                p: 1.5, mb: 1, borderRadius: 1,
                                backgroundColor: '#fff3e0', border: '1px solid #ffe0b2',
                            }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#e65100', fontSize: '0.8rem' }}>
                                    {a.id}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#bf360c', fontSize: '0.75rem', mt: 0.5 }}>
                                    {a.reason}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                )}

                {informational.length > 0 && (
                    <Box>
                        <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                            <InfoIcon sx={{ color: '#1565c0', fontSize: 18 }} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1565c0' }}>
                                NOTAM informatifs ({informational.length})
                            </Typography>
                        </Box>
                        {informational.map((b, i) => (
                            <Box key={i} sx={{
                                p: 1.5, mb: 1, borderRadius: 1,
                                backgroundColor: '#e3f2fd', border: '1px solid #bbdefb',
                            }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1565c0', fontSize: '0.8rem' }}>
                                    {b.id}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#0d47a1', fontSize: '0.75rem', mt: 0.5 }}>
                                    {b.reason}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                )}

                {blocking.length === 0 && attention.length === 0 && informational.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                        Aucun détail NOTAM disponible.
                    </Typography>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} size="small">Fermer</Button>
            </DialogActions>
        </Dialog>
    );
};

const CheckItem = ({ check, onNotamClick }) => {
    const cfg = STATUS_CONFIG[check.status] || STATUS_CONFIG.go;
    const Icon = CHECK_ICONS[check.label] || InfoOutlinedIcon;
    const isNotam = check.label === 'NOTAM' || check.label === 'NOTAM actifs';
    const hasDetails = isNotam && check.notam_details;

    const blockingCount = check.notam_details?.blocking?.length || 0;
    const attentionCount = check.notam_details?.attention?.length || 0;

    let notamSecondary = check.detail;
    if (hasDetails) {
        if (blockingCount > 0) {
            notamSecondary = `${blockingCount} bloquant${blockingCount > 1 ? 's' : ''} — cliquez pour détails`;
        } else if (attentionCount > 0) {
            notamSecondary = `${attentionCount} vigilance — cliquez pour détails`;
        } else {
            notamSecondary = 'Aucun bloquant — cliquez pour détails';
        }
    }

    return (
        <ListItem
            sx={{
                py: 0.5, px: 0,
                ...(hasDetails && { cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' }, borderRadius: 1 }),
            }}
            onClick={hasDetails ? () => onNotamClick(check) : undefined}
        >
            <ListItemIcon sx={{ minWidth: 32 }}>
                <Icon sx={{ color: cfg.color, fontSize: 18 }} />
            </ListItemIcon>
            <ListItemText
                primary={
                    <Box display="flex" alignItems="center" gap={0.5}>
                        <span>{check.label}</span>
                        {hasDetails && (
                            <Typography component="span" sx={{ fontSize: '0.65rem', color: '#1565c0', textDecoration: 'underline' }}>
                                (détails)
                            </Typography>
                        )}
                    </Box>
                }
                secondary={notamSecondary}
                primaryTypographyProps={{ variant: 'body2', fontWeight: 600, fontSize: '0.8rem' }}
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
                    fontSize: '0.6rem',
                    height: 20,
                }}
            />
        </ListItem>
    );
};

export const ScoreOpsView = ({ code }) => {
    const { data: session } = useSession();
    const { client } = useClient();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [notamDialogOpen, setNotamDialogOpen] = useState(false);
    const [notamDialogCheck, setNotamDialogCheck] = useState(null);

    const fetchScore = useCallback(async () => {
        if (!code || !session?.accessToken || !client?.id) return;
        setLoading(true);
        setError(null);
        setSaved(false);
        try {
            const data = await getScoreOps(code, session, client.id);
            setResult(data);
        } catch (err) {
            if (err?.code === 'ECONNABORTED' || err?.message?.includes('timeout')) {
                setError("L'analyse prend plus de temps que prévu (classification NOTAM par Kimi). Réessayez.");
            } else {
                setError(err?.response?.data?.error || err?.response?.data?.message || err?.message || "Erreur lors de l'analyse.");
            }
        } finally {
            setLoading(false);
        }
    }, [code, session, client?.id]);

    useEffect(() => {
        fetchScore();
    }, [fetchScore]);

    const handleSave = async () => {
        if (!result || !code) return;
        setSaving(true);
        try {
            await saveScoreOps(code, result, session, client.id);
            setSaved(true);
        } catch {
            setError('Erreur lors de la sauvegarde.');
        } finally {
            setSaving(false);
        }
    };

    const handleNotamClick = (check) => {
        setNotamDialogCheck(check);
        setNotamDialogOpen(true);
    };

    return (
        <Box sx={{ p: 1 }}>
            {loading && <LinearProgress sx={{ mb: 1 }} />}

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
            )}

            {result?.result === 'no_rules' && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    {result.message || "Aucune règle de vol configurée pour ce club. Contactez votre administrateur."}
                </Alert>
            )}

            {result?.result === 'no_data' && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    {result.message || "Impossible de récupérer les données METAR."}
                </Alert>
            )}

            {result && !['no_rules', 'no_data'].includes(result.result) && (
                <>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Box display="flex" gap={1} alignItems="center">
                            <Chip
                                label={`Station: ${result.icao}`}
                                variant="outlined"
                                size="small"
                                sx={{ fontWeight: 600, fontSize: '0.7rem', height: 24 }}
                            />
                            {result.rule_name && (
                                <Chip
                                    label={`Profil: ${result.rule_name}`}
                                    variant="outlined"
                                    size="small"
                                    color="primary"
                                    sx={{ fontSize: '0.7rem', height: 24 }}
                                />
                            )}
                        </Box>
                        <Tooltip title="Rafraîchir l'analyse">
                            <IconButton onClick={fetchScore} size="small">
                                <RefreshIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    <StatusBadge status={result.result} />

                    {result.checks?.length > 0 && (
                        <Box>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#666', mb: 0.5, display: 'block' }}>
                                DÉTAIL DES PARAMÈTRES
                            </Typography>
                            <MuiList dense disablePadding>
                                {result.checks.map((check, i) => (
                                    <CheckItem key={i} check={check} onNotamClick={handleNotamClick} />
                                ))}
                            </MuiList>
                        </Box>
                    )}

                    {result.metar_raw && (
                        <Box mt={1.5}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#666' }}>
                                METAR
                            </Typography>
                            <Typography variant="body2" sx={{
                                fontFamily: 'monospace',
                                fontSize: '0.72rem',
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

                    <Divider sx={{ my: 1.5 }} />

                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Button
                            startIcon={saving ? <CircularProgress size={14} /> : <SaveIcon />}
                            onClick={handleSave}
                            disabled={saving || saved}
                            size="small"
                            variant={saved ? "outlined" : "contained"}
                            color={saved ? "success" : "primary"}
                            sx={{ fontSize: '0.75rem' }}
                        >
                            {saved ? 'Enregistré' : "Sauvegarder l'analyse"}
                        </Button>
                    </Box>

                    <Alert severity="warning" sx={{ mt: 1.5, '& .MuiAlert-message': { fontSize: '0.65rem' } }}>
                        {result.disclaimer || "Cet outil fournit une aide à la décision basée sur les paramètres définis par l'exploitant. Le commandant de bord reste seul décisionnaire."}
                    </Alert>
                </>
            )}

            {!result && !loading && !error && (
                <Box textAlign="center" py={3}>
                    <CircularProgress size={24} />
                    <Typography variant="body2" color="text.secondary" mt={1} fontSize="0.8rem">
                        Chargement de l'analyse...
                    </Typography>
                </Box>
            )}

            <NotamDialog
                open={notamDialogOpen}
                onClose={() => setNotamDialogOpen(false)}
                check={notamDialogCheck}
            />
        </Box>
    );
};
