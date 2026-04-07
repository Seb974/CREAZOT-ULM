import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Table, TableHead, TableRow, TableCell,
  TableBody, Chip, IconButton, Tooltip, Select, MenuItem,
  CircularProgress, Alert, useMediaQuery, Theme, Card, CardContent,
  CardActions, Stack,
} from '@mui/material';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { useSessionContext } from '../SessionContextProvider';
import { useClient } from '../ClientProvider';
import { useNotify } from 'react-admin';

interface Member {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  clientRole: string;
  isSuperAdmin: boolean;
}

const getRoleLabel = (member: Member): string => {
  if (member.isSuperAdmin) return 'Super Admin';
  if (member.clientRole === 'admin') return 'Admin';
  return 'Pilote';
};

const getRoleColor = (member: Member): 'error' | 'warning' | 'default' => {
  if (member.isSuperAdmin) return 'error';
  if (member.clientRole === 'admin') return 'warning';
  return 'default';
};

export const MembersList = () => {
  const { session } = useSessionContext();
  const { client } = useClient();
  const notify = useNotify();
  const isSmall = useMediaQuery<Theme>((theme) => theme.breakpoints.down('sm'));

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clientId = client?.id;

  const fetchMembers = useCallback(async () => {
    if (!session?.accessToken || !clientId) return;
    setLoading(true);
    try {
      const headers = {
        Authorization: `Bearer ${session.accessToken}`,
        Accept: 'application/ld+json',
        'X-Client-Id': String(clientId),
      };

      const [usersRes, ucrRes] = await Promise.all([
        fetch(`/users?pagination=false`, { headers }),
        fetch(`/user_client_roles?client=/clients/${clientId}&pagination=false`, { headers }),
      ]);

      const usersData = await usersRes.json();
      const ucrData = await ucrRes.json();

      const ucrMap: Record<string, string> = {};
      (ucrData['hydra:member'] || []).forEach((ucr: any) => {
        const userId = typeof ucr.user === 'string'
          ? ucr.user.split('/').pop()
          : (ucr.user?.id || ucr.user?.['@id']?.split('/').pop());
        if (userId) ucrMap[String(userId)] = ucr.role;
      });

      const allUsers = (usersData['hydra:member'] || []);
      const filtered: Member[] = allUsers
        .filter((u: any) =>
          u.clients?.some((c: any) => {
            const cId = typeof c === 'string' ? c.split('/').pop() : c.id;
            return String(cId) === String(clientId);
          })
        )
        .map((u: any) => {
          const userId = u['@id']?.split('/').pop() || u.id;
          const globalRoles = u.roles || [];
          const isSuperAdmin = globalRoles.includes('ROLE_SUPER_ADMIN')
            || globalRoles.includes('super_admin');
          return {
            id: userId,
            email: u.email,
            firstName: u.firstName || '',
            lastName: u.lastName || '',
            clientRole: isSuperAdmin ? 'super_admin' : (ucrMap[String(userId)] || 'pilot'),
            isSuperAdmin,
          };
        });

      setMembers(filtered);
      setError(null);
    } catch {
      setError('Erreur lors du chargement des membres');
    } finally {
      setLoading(false);
    }
  }, [session, clientId]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const handleRoleChange = async (member: Member, newRole: string) => {
    try {
      const res = await fetch(`/api/users/${member.id}/role`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
          'Content-Type': 'application/json',
          'X-Client-Id': String(clientId),
        },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erreur');
      }
      notify(`Rôle mis à jour pour ${member.firstName} ${member.lastName}`, { type: 'success' });
      fetchMembers();
    } catch (e: any) {
      notify(e.message || 'Erreur lors du changement de rôle', { type: 'error' });
    }
  };

  const handleDetach = async (member: Member) => {
    if (!confirm(`Retirer ${member.firstName} ${member.lastName} de ce client ?`)) return;
    try {
      const res = await fetch(`/api/users/${member.id}/detach/${clientId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erreur');
      }
      notify(`${member.firstName} ${member.lastName} a été retiré du client`, { type: 'success' });
      fetchMembers();
    } catch (e: any) {
      notify(e.message || 'Erreur lors du retrait', { type: 'error' });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;

  const currentUserEmail = session?.user?.email;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
        Membres rattachés
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {members.length} membre{members.length > 1 ? 's' : ''} rattaché{members.length > 1 ? 's' : ''} à {client?.name || 'ce client'}
      </Typography>

      {isSmall ? (
        <Stack spacing={1}>
          {members.map((m) => (
            <Card key={m.id} variant="outlined">
              <CardContent sx={{ pb: 1 }}>
                <Typography fontWeight={600}>
                  {m.firstName} {m.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">{m.email}</Typography>
                <Chip
                  label={getRoleLabel(m)}
                  size="small"
                  color={getRoleColor(m)}
                  sx={{ mt: 1 }}
                />
              </CardContent>
              {m.email !== currentUserEmail && !m.isSuperAdmin && (
                <CardActions>
                  <Select
                    size="small"
                    value={m.clientRole === 'admin' ? 'admin' : 'pilot'}
                    onChange={(e) => handleRoleChange(m, e.target.value)}
                    sx={{ minWidth: 100 }}
                  >
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="pilot">Pilote</MenuItem>
                  </Select>
                  <Tooltip title="Retirer du client">
                    <IconButton color="error" onClick={() => handleDetach(m)} size="small">
                      <PersonRemoveIcon />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              )}
            </Card>
          ))}
        </Stack>
      ) : (
        <Paper variant="outlined">
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#ededed' }}>
                <TableCell sx={{ fontWeight: 'lighter' }}>Prénom</TableCell>
                <TableCell sx={{ fontWeight: 'lighter' }}>Nom</TableCell>
                <TableCell sx={{ fontWeight: 'lighter' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'lighter' }}>Rôle</TableCell>
                <TableCell sx={{ fontWeight: 'lighter' }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {members.map((m) => {
                const isCurrentUser = m.email === currentUserEmail;
                const canManage = !isCurrentUser && !m.isSuperAdmin;

                return (
                  <TableRow key={m.id} hover>
                    <TableCell>{m.firstName}</TableCell>
                    <TableCell>{m.lastName}</TableCell>
                    <TableCell>{m.email}</TableCell>
                    <TableCell>
                      {canManage ? (
                        <Select
                          size="small"
                          value={m.clientRole === 'admin' ? 'admin' : 'pilot'}
                          onChange={(e) => handleRoleChange(m, e.target.value)}
                          sx={{ minWidth: 100 }}
                        >
                          <MenuItem value="admin">Admin</MenuItem>
                          <MenuItem value="pilot">Pilote</MenuItem>
                        </Select>
                      ) : (
                        <Chip
                          label={getRoleLabel(m)}
                          size="small"
                          color={getRoleColor(m)}
                        />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {canManage && (
                        <Tooltip title="Retirer du client">
                          <IconButton color="error" onClick={() => handleDetach(m)} size="small">
                            <PersonRemoveIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  );
};
