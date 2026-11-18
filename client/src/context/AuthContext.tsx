
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  refreshAccessToken,
  setAccessToken,
} from "../services/api";

import { authService } from "../services/auth.service";

import type {
  LoginPayload,
  RegisterPayload,
  User,
} from "../types/auth.types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session when application starts
  useEffect(() => {
    let isActive = true;

    const initializeAuth = async () => {
      try {
        await refreshAccessToken();

        if (!isActive) return;

        const currentUser = await authService.getCurrentUser();

        if (isActive) {
          setUser(currentUser);
        }
      } catch {
        if (isActive) {
          console.error("Session restoration failed.");

          setAccessToken(null);
          setUser(null);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isActive = false;
    };
  }, []);

  // Listen for expired sessions
  useEffect(() => {
    const handleSessionExpired = () => {
      setAccessToken(null);
      setUser(null);
    };

    window.addEventListener(
      "auth:session-expired",
      handleSessionExpired
    );

    return () => {
      window.removeEventListener(
        "auth:session-expired",
        handleSessionExpired
      );
    };
  }, []);

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  // Login
  const login = async (payload: LoginPayload) => {
    const authData = await authService.login(payload);
    setUser(authData.user);
  };

  // Register
  const register = async (payload: RegisterPayload) => {
    await authService.register(payload);
  };

  // Logout
  const logout = async () => {
    try {
      await authService.logOut();
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider"
    );
  }

  return context;
};
