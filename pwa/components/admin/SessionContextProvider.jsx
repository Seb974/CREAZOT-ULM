import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';

const SESSION_KEY = 'internSession';

const SessionContext = createContext({
  session: null,
  status: 'loading',
});

export const useSessionContext = () => useContext(SessionContext);

export const SessionContextProvider = ({ children }) => {
  const { data: liveSession, status } = useSession();

  const [cachedSession, setCachedSession] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem(SESSION_KEY);
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  });

  // On met à jour le cache quand la session est valide
  useEffect(() => {
    if (status === 'authenticated' && liveSession) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(liveSession));
      setCachedSession(liveSession);
    }
  }, [status, liveSession]);

  // On nettoie si déconnecté ou session expirée
  useEffect(() => {
    if (status === 'unauthenticated') {
      sessionStorage.removeItem(SESSION_KEY);
      setCachedSession(null);
    }
  }, [status]);

  const contextValue = useMemo(() => {
    const session = status === 'authenticated' ? liveSession : cachedSession;
    return { session, status };
  }, [status, liveSession, cachedSession]);

  // Fallback null si rien n’est disponible
  const shouldDelayRender = status === 'loading' && !liveSession && !cachedSession;

  if (shouldDelayRender)
    return null;

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
};