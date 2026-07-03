// Google OAuth token response
export type TokenResponse = {
  access_token: string;
  id_token?: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
};

export type SessionPayload = {
  unionId: string;
  clientId: string;
};

// Google userinfo response (/oauth2/v2/userinfo)
export type UserProfile = {
  id: string;
  email: string;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  verified_email?: boolean;
};
