export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: string;
}

// User shape safe to expose over the API — never carries the password.
export type PublicUser = Omit<User, 'password'>;
