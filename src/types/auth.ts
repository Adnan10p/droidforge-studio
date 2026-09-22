export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  providerId: "google.com" | "guest" | "custom";
  createdAt: string;
  lastLoginAt: string;
  projectsCount?: number;
  plan?: "Community Free" | "Developer Pro" | "Studio Enterprise";
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
}
