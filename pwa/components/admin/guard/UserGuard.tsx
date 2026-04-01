import { useEffect, useState } from 'react';
import { useSessionContext } from '../SessionContextProvider';
import SyncLoader from 'react-spinners/SyncLoader';
import OnboardingScreen from './OnboardingScreen';
import SuspendedScreen from './SuspendedScreen';

interface UserGuardProps {
  children: React.ReactNode;
}

const UserGuard = ({ children }: UserGuardProps) => {
  const { session } = useSessionContext();
  const [status, setStatus] = useState<'loading' | 'no_clients' | 'no_active' | 'ok'>('loading');
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    if (!session?.accessToken || !session?.user?.email) return;
    fetchUserData();
  }, [session?.accessToken, session?.user?.email]);

  const fetchUserData = async () => {
    try {
      const email = session?.user?.email;
      const res = await fetch(`/users?email=${encodeURIComponent(email!)}`, {
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
          'Accept': 'application/ld+json',
        },
      });
      const data = await res.json();
      const users = data['hydra:member'] || [];

      if (users.length === 0) {
        setStatus('no_clients');
        return;
      }

      const user = users[0];
      setCurrentUser(user);
      const clients = user.clients || [];

      if (clients.length === 0) {
        setStatus('no_clients');
        return;
      }

      const usableClients = clients.filter((c: any) =>
        c.active !== false && c.subscriptionStatus !== 'suspended' && c.subscriptionStatus !== 'cancelled'
      );
      if (usableClients.length === 0) {
        setStatus('no_active');
        return;
      }

      setStatus('ok');
    } catch (e) {
      console.error('Erreur lors de la vérification du profil utilisateur', e);
      setStatus('ok');
    }
  };

  const isSuperAdmin =
    session?.user?.roles?.includes('ROLE_SUPER_ADMIN') ||
    session?.user?.roles?.includes('super_admin');

  if (isSuperAdmin) {
    return <>{children}</>;
  }

  if (status === 'loading') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <SyncLoader size={8} color="#46B6BF" />
      </div>
    );
  }

  if (status === 'no_clients') {
    return <OnboardingScreen session={session} currentUser={currentUser} onRequestSent={() => fetchUserData()} />;
  }

  if (status === 'no_active') {
    return <SuspendedScreen />;
  }

  return <>{children}</>;
};

export default UserGuard;
