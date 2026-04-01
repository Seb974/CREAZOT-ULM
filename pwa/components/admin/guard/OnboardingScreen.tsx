import { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Button, TextField, Select, MenuItem, FormControl, InputLabel, Alert, Chip } from '@mui/material';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

interface OnboardingScreenProps {
  session: any;
  currentUser: any;
  onRequestSent: () => void;
}

const OnboardingScreen = ({ session, currentUser, onRequestSent }: OnboardingScreenProps) => {
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchActiveClients();
    if (currentUser) fetchPendingRequests();
  }, [currentUser]);

  const fetchActiveClients = async () => {
    try {
      const res = await fetch('/clients?active=true&pagination=false', {
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
          'Accept': 'application/ld+json',
        },
      });
      const data = await res.json();
      setClients(data['hydra:member'] || []);
    } catch (e) {
      console.error('Erreur chargement clients', e);
    }
  };

  const fetchPendingRequests = async () => {
    if (!currentUser?.['@id']) return;
    try {
      const res = await fetch(`/client_access_requests?requestedBy=${encodeURIComponent(currentUser['@id'])}&status=pending`, {
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
          'Accept': 'application/ld+json',
        },
      });
      const data = await res.json();
      setPendingRequests(data['hydra:member'] || []);
    } catch (e) {
      console.error('Erreur chargement demandes', e);
    }
  };

  const handleSubmit = async () => {
    if (!selectedClient || !currentUser?.['@id']) return;
    setSending(true);
    setError('');

    try {
      const res = await fetch('/client_access_requests', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
          'Content-Type': 'application/ld+json',
        },
        body: JSON.stringify({
          requestedBy: currentUser['@id'],
          client: selectedClient,
          message: message || null,
        }),
      });

      if (res.ok) {
        setSent(true);
        setMessage('');
        setSelectedClient('');
        fetchPendingRequests();
      } else {
        const data = await res.json();
        setError(data['hydra:description'] || 'Une erreur est survenue.');
      }
    } catch (e) {
      setError('Impossible d\'envoyer la demande. Veuillez réessayer.');
    } finally {
      setSending(false);
    }
  };

  const firstName = session?.user?.name?.split(' ')[0] || currentUser?.firstName || '';

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      p: 2,
    }}>
      <Card sx={{ maxWidth: 560, width: '100%', borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <FlightTakeoffIcon sx={{ fontSize: 48, color: '#46B6BF', mb: 1 }} />
            <Typography variant="h5" fontWeight={600}>
              Bienvenue{firstName ? `, ${firstName}` : ''} !
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Votre compte est bien créé. Pour accéder à l'application, vous devez être rattaché à un client.
            </Typography>
          </Box>

          {pendingRequests.length > 0 && (
            <Alert icon={<HourglassEmptyIcon />} severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2" fontWeight={500}>
                Demande(s) en attente de validation :
              </Typography>
              <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {pendingRequests.map((req: any) => (
                  <Chip
                    key={req.id}
                    label={req.client?.name || 'Client'}
                    size="small"
                    color="info"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Alert>
          )}

          {!currentUser?.['@id'] && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Votre profil utilisateur n'a pas encore été synchronisé. Veuillez vous déconnecter et vous reconnecter, ou contacter un administrateur.
            </Alert>
          )}

          {sent ? (
            <Alert icon={<CheckCircleIcon />} severity="success" sx={{ mb: 2 }}>
              Votre demande a été envoyée avec succès. Un administrateur la traitera prochainement.
            </Alert>
          ) : currentUser?.['@id'] && (
            <>
              <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                Sélectionnez le client auquel vous souhaitez être rattaché :
              </Typography>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Client</InputLabel>
                <Select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  label="Client"
                >
                  {clients.map((c: any) => (
                    <MenuItem key={c.id} value={c['@id']}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {c.color && (
                          <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: c.color, flexShrink: 0 }} />
                        )}
                        {c.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Message (optionnel)"
                placeholder="Précisez votre rôle ou toute information utile..."
                multiline
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                sx={{ mb: 2 }}
              />

              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

              <Button
                variant="contained"
                fullWidth
                onClick={handleSubmit}
                disabled={!selectedClient || sending}
                startIcon={<SendIcon />}
                sx={{
                  py: 1.2,
                  backgroundColor: '#46B6BF',
                  '&:hover': { backgroundColor: '#3a9ba3' },
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                {sending ? 'Envoi en cours...' : 'Envoyer la demande'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default OnboardingScreen;
