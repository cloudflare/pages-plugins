import { Identity } from "..";

export const getIdentity = async ({
  jwt,
  domain,
}: {
  jwt: string;
  domain: string;
}): Promise<undefined | Identity> => {
  const identityURL = new URL("/cdn-cgi/access/get-identity", domain);
  const response = await fetch(identityURL.toString(), {
    headers: { Cookie: `CF_Authorization=${jwt}` },
  });
  if (response.ok) return await response.json();
};

export const generateLoginURL = ({
  redirectURL: redirectURLInit,
  domain,
  aud,
}: {
  redirectURL: string | URL;
  domain: string;
  aud: string;
}): string => {
  const redirectURL =
    typeof redirectURLInit === "string"
      ? new URL(redirectURLInit)
      : redirectURLInit;
  const { hostname } = redirectURL;
  const loginPathname = `/cdn-cgi/access/login/${hostname}?`;
  const searchParams = new URLSearchParams({
    kid: aud,
    redirect_url: redirectURL.pathname + redirectURL.search,
  });
  return new URL(loginPathname + searchParams.toString(), domain).toString();
};

export const generateLogoutURL = ({ domain }: { domain: string }) =>
  new URL(`/cdn-cgi/access/logout`, domain).toString();
