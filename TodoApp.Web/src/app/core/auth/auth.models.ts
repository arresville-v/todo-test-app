export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  userName: string;
  createdAt: string;
}

export interface LoginResponse {
  token: string;
  user: UserProfile;
}

export interface LoginCredentials {
  userName: string;
  password: string;
}

export interface RegisterDetails extends LoginCredentials {
  name: string;
  email: string;
}

export interface UpdateUserProfile {
  name: string;
  email: string;
  userName: string;
}
