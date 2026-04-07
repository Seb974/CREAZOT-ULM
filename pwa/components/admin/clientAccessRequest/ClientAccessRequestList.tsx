import { Datagrid, DateField, FunctionField, List, TextField, useNotify, useRefresh } from 'react-admin';
import { Button, Chip, Box } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useSessionContext } from '../SessionContextProvider';
import { getFormattedValueForBackEnd } from '../../../app/lib/utils';

const statusColors: Record<string, 'warning' | 'success' | 'error'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
};

const statusLabels: Record<string, string> = {
  pending: 'En attente',
  approved: 'Approuvée',
  rejected: 'Refusée',
};

export const ClientAccessRequestList = () => {
  const { session } = useSessionContext();
  const notify = useNotify();
  const refresh = useRefresh();

  const handleAction = async (record: any, newStatus: 'approved' | 'rejected') => {
    try {
      const res = await fetch(record['@id'], {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
          'Content-Type': 'application/merge-patch+json',
        },
        body: JSON.stringify({
          status: newStatus,
          processedAt: new Date().toISOString(),
          processedBy: getFormattedValueForBackEnd(session?.user),
        }),
      });

      if (!res.ok) throw new Error();

      if (newStatus === 'approved') {
        const userIri = record.requestedBy?.['@id'] || getFormattedValueForBackEnd(record.requestedBy);
        const clientIri = record.client?.['@id'] || getFormattedValueForBackEnd(record.client);

        if (userIri) {
          const userRes = await fetch(userIri, {
            headers: {
              'Authorization': `Bearer ${session?.accessToken}`,
              'Accept': 'application/ld+json',
            },
          });
          const userData = await userRes.json();
          const existingClients = (userData.clients || []).map((c: any) => c['@id'] || c);

          if (!existingClients.includes(clientIri)) {
            await fetch(userIri, {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${session?.accessToken}`,
                'Content-Type': 'application/merge-patch+json',
              },
              body: JSON.stringify({ clients: [...existingClients, clientIri] }),
            });
          }

          await fetch('/user_client_roles', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session?.accessToken}`,
              'Content-Type': 'application/ld+json',
              'Accept': 'application/ld+json',
            },
            body: JSON.stringify({
              user: userIri,
              client: clientIri,
              role: 'pilot',
            }),
          });
        }
      }

      notify(newStatus === 'approved' ? 'Demande approuvée, utilisateur rattaché.' : 'Demande refusée.', { type: 'success' });
      refresh();
    } catch (e) {
      notify('Erreur lors du traitement de la demande.', { type: 'error' });
    }
  };

  return (
    <List
      resource="client_access_requests"
      sort={{ field: 'createdAt', order: 'DESC' }}
      filter={{ status: 'pending' }}
    >
      <Datagrid bulkActionButtons={false} sx={{ '& .RaDatagrid-headerCell': { backgroundColor: '#ededed', fontWeight: 'lighter' } }}>
        <FunctionField
          label="Demandeur"
          render={(record: any) => {
            const u = record?.requestedBy;
            return u ? `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email : '—';
          }}
        />
        <FunctionField
          label="Email"
          render={(record: any) => record?.requestedBy?.email || '—'}
        />
        <FunctionField
          label="Client demandé"
          render={(record: any) => {
            const c = record?.client;
            if (!c) return '—';
            return (
              <Chip
                label={c.name}
                size="small"
                sx={{
                  backgroundColor: c.color ? `${c.color}20` : '#e0e0e0',
                  color: c.color || '#666',
                  border: `1px solid ${c.color ? `${c.color}55` : '#ccc'}`,
                  fontWeight: 500,
                }}
              />
            );
          }}
        />
        <TextField source="message" label="Message" emptyText="—" />
        <DateField source="createdAt" label="Date" showTime />
        <FunctionField
          label="Statut"
          render={(record: any) => (
            <Chip
              label={statusLabels[record?.status] || record?.status}
              size="small"
              color={statusColors[record?.status] || 'default'}
            />
          )}
        />
        <FunctionField
          label="Actions"
          render={(record: any) => {
            if (record?.status !== 'pending') return null;
            return (
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => handleAction(record, 'approved')}
                  sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                >
                  Approuver
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={() => handleAction(record, 'rejected')}
                  sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                >
                  Refuser
                </Button>
              </Box>
            );
          }}
        />
      </Datagrid>
    </List>
  );
};
