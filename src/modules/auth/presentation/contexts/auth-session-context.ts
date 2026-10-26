import { createContext } from 'react';
import type { AuthSession } from '../types/auth-session.type';

export const AuthSessionContext = createContext<AuthSession | null>(null);
