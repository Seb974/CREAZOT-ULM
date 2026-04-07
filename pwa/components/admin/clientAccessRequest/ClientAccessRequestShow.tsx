import { Show, SimpleShowLayout, TextField, DateField, FunctionField } from 'react-admin';
import { Chip } from '@mui/material';

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

export const ClientAccessRequestShow = () => (
  <Show>
    <SimpleShowLayout>
      <FunctionField
        label="Demandeur"
        render={(record: any) => {
          const u = record?.requestedBy;
          if (!u) return '—';
          const name = `${u.firstName || ''} ${u.lastName || ''}`.trim();
          return name ? `${name} (${u.email})` : u.email || '—';
        }}
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
      <TextField source="message" label="Message" emptyText="—" />
      <DateField source="createdAt" label="Date de demande" showTime />
      <DateField source="processedAt" label="Date de traitement" showTime emptyText="—" />
      <FunctionField
        label="Traitée par"
        render={(record: any) => {
          const u = record?.processedBy;
          if (!u) return '—';
          const name = `${u.firstName || ''} ${u.lastName || ''}`.trim();
          return name ? `${name} (${u.email})` : u.email || '—';
        }}
      />
    </SimpleShowLayout>
  </Show>
);
