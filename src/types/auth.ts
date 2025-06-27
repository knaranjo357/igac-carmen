export type UserRole = 'root' | 'admin' | 'recognizer' | 'viewer';

export interface User {
  email: string;
  password: string;
  role: UserRole;
  name?: string;
  avatar?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  currentUser: User | null;
}

export const ROLE_HIERARCHY = {
  root: 4,
  admin: 3,
  recognizer: 2,
  viewer: 1
} as const;

export const ROLE_COLORS = {
  root: 'bg-red-100 text-red-800',
  admin: 'bg-purple-100 text-purple-800',
  recognizer: 'bg-blue-100 text-blue-800',
  viewer: 'bg-green-100 text-green-800'
} as const;