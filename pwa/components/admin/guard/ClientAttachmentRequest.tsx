import { useEffect, useState } from 'react';
import { Title } from 'react-admin';
import {
  Box, Typography, Card, CardContent, Button, TextField,
  Select, MenuItem, FormControl, InputLabel, Alert, Chip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import { useSessionContext } from '../SessionContextProvider';

const ClientAttachmentRequest = () => {
  const { session } = useSessionContext();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [allClients, setAllClients] = useState<any[]>([]);
  const [userClientIds, setUserClientIds] = useState<Set<string>>(new Set());
  const [pendingRequestClientIds, setPendingRequestClientIds] = useState<Set<string>>(new Set());
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const headers = {
    'Authorization': `Bearer ${session?.accessToken}`,
    'Accept': 'application/ld+json',
  };

  useEffect(() => {
    if (!session?.accessToken || !session?.user?.email) return;
    loadData();
  }, [session?.accessToken, session?.user?.email]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [userData, clientsData] = await Promise.all([
        fetch(`/users?email=${encodeURIComponent(session!.user!.email!)}`, { headers }).then(r => r.json()),
        fetch('/clients?active=true&pagination=false', { headers }).then(r => r.json()),
      ]);

      const users = userData['hydra:member'] || [];
      const user = users[0] || null;
      setCurrentUser(user);

      const attachedIds = new Set<string>((user?.clients || []).map((c: any) => c['@id']));
      setUserClientIds(attachedIds);

      setAllClients(clientsData['hydra:member'] || []);

      if (user?.['@id']) {
        const reqData = await fetch(
          `/client_access_requests?requestedBy=${encodeURIComponent(user['@id'])}&status=pending`,
          { headers }
        ).then(r => r.json());
        const reqs = reqData['hydra:member'] || [];
        setPendingRequests(reqs);
        setPendingRequestClientIds(new Set(reqs.map((r: any) => r.client?.['@id']).filter(Boolean)));
      }
    } catch (e) {
      console.error('Erreur chargement données', e);
    } finally {
      setLoading(false);
    }
  };

  const availableClients = allClients.filter(
    c => !userClientIds.has(c['@id']) && !pendingRequestClientIds.has(c['@id'])
  );

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
        await loadData();
        setTimeout(() => setSent(false), 4000);
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

  if (loading) return null;

  const attachedClients = allClients.filter(c => userClientIds.has(c['@id']));

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', mt: 2 }}>
      <Title title="Demande de rattachement" />

      {/* Clients actuels */}
      {attachedClients.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
              Vos clients actuels
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {attachedClients.map((c: any) => (
                <Chip
                  key={c['@id']}
                  label={c.name}
                  sx={{
                    backgroundColor: c.color ? `${c.color}20` : '#e0e0e0',
                    color: c.color || '#666',
                    border: `1px solid ${c.color ? `${c.color}55` : '#ccc'}`,
                    fontWeight: 500,
                  }}
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Demandes en attente */}
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

      {/* Formulaire de demande */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <GroupAddIcon sx={{ color: '#46B6BF' }} />
            <Typography variant="subtitle1" fontWeight={600}>
              Demander un rattachement
            </Typography>
          </Box>

          {sent && (
            <Alert icon={<CheckCircleIcon />} severity="success" sx={{ mb: 2 }}>
              Votre demande a été envoyée avec succès.
            </Alert>
          )}

          {availableClients.length === 0 ? (
            <Alert severity="info">
              Vous êtes déjà rattaché à tous les clients actifs, ou des demandes sont en attente pour les autres.
            </Alert>
          ) : (
            <>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Client</InputLabel>
                <Select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  label="Client"
                >
                  {availableClients.map((c: any) => (
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
                onClick={handleSubmit}
                disabled={!selectedClient || sending}
                startIcon={<SendIcon />}
                sx={{
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

export default ClientAttachmentRequest;
