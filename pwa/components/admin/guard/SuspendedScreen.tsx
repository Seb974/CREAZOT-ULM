import { Box, Typography, Card, CardContent, Button } from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import LogoutIcon from '@mui/icons-material/Logout';
import { signOut } from 'next-auth/react';
import { NEXT_PUBLIC_OIDC_SERVER_URL } from '../../../config/keycloak';

const SuspendedScreen = () => {

  const handleLogout = async () => {
    const stored = sessionStorage.getItem('internSession');
    let idToken = '';
    if (stored) {
      try { idToken = JSON.parse(stored).idToken || ''; } catch (e) {}
    }
    sessionStorage.removeItem('client');
    sessionStorage.removeItem('internSession');
    await signOut({
      callbackUrl: idToken
        ? `${NEXT_PUBLIC_OIDC_SERVER_URL}/protocol/openid-connect/logout?id_token_hint=${idToken}&post_logout_redirect_uri=${window.location.origin}`
        : '/',
    });
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #fef9f0 0%, #f0d9b5 100%)',
      p: 2,
    }}>
      <Card sx={{ maxWidth: 480, width: '100%', borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <BlockIcon sx={{ fontSize: 48, color: '#e67e22', mb: 2 }} />
          <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>
            Accès suspendu
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Aucun de vos clients associés n'est actuellement actif.
            Veuillez contacter votre administrateur pour rétablir votre accès.
          </Typography>
          <Button
            variant="outlined"
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
            sx={{ textTransform: 'none' }}
          >
            Se déconnecter
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SuspendedScreen;
