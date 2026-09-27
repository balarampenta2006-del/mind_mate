import { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { login as apiLogin, logout as apiLogout, register as apiRegister } from '@/services/authService.js';
import { getUnreadCount } from '@/services/notificationService.js';

const SESSION_KEY = 'smhc_session';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // true during initial session restore
  notificationCount: 0,
};

function reducer(state, action) {
  switch (action.type) {
    case 'RESTORE':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        notificationCount: action.payload.notificationCount || 0,
      };
    case 'LOGIN':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        notificationCount: action.payload.notificationCount || 0,
      };
    case 'LOGOUT':
      return { ...initialState, isLoading: false };
    case 'READY':
      return { ...state, isLoading: false };
    case 'SET_NOTIFICATION_COUNT':
      return { ...state, notificationCount: action.payload };
    case 'DECREMENT_NOTIFICATIONS':
      return { ...state, notificationCount: Math.max(0, state.notificationCount - action.payload) };
    case 'UPDATE_USER': {
      const updated = { ...state.user, ...action.payload };
      try {
        const raw = sessionStorage.getItem('smhc_session');
        if (raw) {
          const session = JSON.parse(raw);
          sessionStorage.setItem('smhc_session', JSON.stringify({ ...session, user: updated }));
        }
      } catch { /* ignore */ }
      return { ...state, user: updated };
    }
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Restore session on mount
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        const { user, token } = JSON.parse(raw);
        if (user && token) {
          getUnreadCount(user.userId)
            .then((count) => dispatch({ type: 'RESTORE', payload: { user, notificationCount: count } }))
            .catch(() => dispatch({ type: 'RESTORE', payload: { user, notificationCount: 0 } }));
          return;
        }
      }
    } catch {
      // corrupted session — ignore
    }
    dispatch({ type: 'READY' });
  }, []);

  const login = useCallback(async (credentials, role) => {
    const { user, token } = await apiLogin({ ...credentials, role });
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ user, token }));
    const count = await getUnreadCount(user.userId).catch(() => 0);
    dispatch({ type: 'LOGIN', payload: { user, notificationCount: count } });
    return user;
  }, []);

  const register = useCallback(async (data) => {
    const { user, token } = await apiRegister(data);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ user, token }));
    dispatch({ type: 'LOGIN', payload: { user, notificationCount: 0 } });
    return user;
  }, []);

  const logout = useCallback(async () => {
    try { await apiLogout(); } catch { /* ignore */ }
    sessionStorage.removeItem(SESSION_KEY);
    dispatch({ type: 'LOGOUT' });
  }, []);

  const setNotificationCount = useCallback((count) => {
    dispatch({ type: 'SET_NOTIFICATION_COUNT', payload: count });
  }, []);

  const decrementNotifications = useCallback((by = 1) => {
    dispatch({ type: 'DECREMENT_NOTIFICATIONS', payload: by });
  }, []);

  /** Update user fields in state + sessionStorage without re-login */
  const updateUser = useCallback((updates) => {
    dispatch({ type: 'UPDATE_USER', payload: updates });
  }, []);

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      logout,
      setNotificationCount,
      decrementNotifications,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

/** @returns {ReturnType<typeof AuthProvider> & typeof initialState} */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
