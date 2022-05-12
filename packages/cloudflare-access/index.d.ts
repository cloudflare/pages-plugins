export type Identity = {
  id: string;
  name: string;
  email: string;
  groups: string[];
  amr: string[];
  idp: { id: string; type: string };
  geo: { country: string };
  user_uuid: string;
  account_id: string;
  ip: string;
  auth_status: string;
  common_name: string;
  service_token_id: string;
  service_token_status: boolean;
  is_warp: boolean;
  is_gateway: boolean;
  version: number;
  device_sessions: Record<string, { last_authenticated: number }>;
  iat: number;
};

export type JWTPayload = {
  aud: string | string[];
  common_name?: string; // Service token client ID
  country?: string;
  custom?: unknown;
  email?: string;
  exp: number;
  iat: number;
  nbf?: number;
  iss: string; // https://<domain>.cloudflareaccess.com
  type?: string; // Always just 'app'?
  identity_nonce?: string;
  sub: string; // Empty string for service tokens or user ID otherwise
};

export type PluginArgs = {
  aud: string;
  domain: string;
};

export type PluginData = {
  cloudflareAccess: {
    JWT: {
      payload: JWTPayload;
      getIdentity: () => Promise<undefined | Identity>;
    };
  };
};

export default function (args: PluginArgs): PagesFunction;
