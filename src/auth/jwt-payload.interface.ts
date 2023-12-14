export interface JwtPayload {
  username: string;
  email?: string;
  id: string;
  role: string;
  fullName: string;
}
