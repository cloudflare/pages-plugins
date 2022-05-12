export type PluginArgs = {
  project_id: string;
  secret: string;
  env: string;
  session_token?: string;
  session_jwt?: string;
  session_duration_minutes?: number;
};

export type PluginData = {
  stytch: {
    session: {
      status_code: number;
      request_id: string;
      session: {
        attributes: {
          ip_address: string;
          user_agent: string;
        };
        authentication_factors: Record<string, unknown>[];
        expires_at: string;
        last_accessed_at: string;
        session_id: string;
        started_at: string;
        user_id: string;
      };
      session_jwt: string;
      session_token: string;
    };
  };
};

export default function (args: PluginArgs): PagesFunction;
