import { KJUR } from "jsrsasign";
import type { chat_v1 } from "@googleapis/chat";

const ONE_MINUTE = 60;

export class GoogleChatAPI {
  private emailAddress: string;
  private privateKey: string;

  private tokenExpiration: number;

  constructor({
    credentials: { client_email, private_key },
    tokenExpiration = ONE_MINUTE * 15,
  }: {
    credentials: { client_email: string; private_key: string };
    tokenExpiration?: number;
  }) {
    this.emailAddress = client_email;
    this.privateKey = private_key;

    this.tokenExpiration = tokenExpiration;
  }

  private _token: string;

  get token(): Promise<string> {
    return (async () => {
      if (this._token) return this._token;

      const oHeader = { alg: "RS256", typ: "JWT" };
      const tNow = KJUR.jws.IntDate.get("now");
      const tEnd = tNow + this.tokenExpiration;
      const oPayload = {
        iss: this.emailAddress,
        scope: "https://www.googleapis.com/auth/chat.bot",
        aud: "https://oauth2.googleapis.com/token",
        iat: tNow,
        exp: tEnd,
      };

      const sHeader = JSON.stringify(oHeader);
      const sPayload = JSON.stringify(oPayload);
      const sJWT = KJUR.jws.JWS.sign(
        "RS256",
        sHeader,
        sPayload,
        this.privateKey
      );

      const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
          assertion: sJWT,
        }).toString(),
      });

      const { access_token } = await response.json();

      this._token = access_token;
      return access_token;
    })();
  }

  private api = async (...args: Parameters<typeof fetch>) => {
    const request = new Request(new Request(...args).clone());

    request.headers.set("Authorization", `Bearer ${await this.token}`);
    request.headers.set("Content-Type", "application/json");

    const response = await fetch(request);

    return (await response.json()) as Promise<any>;
  };

  downloadMedia = async ({
    resourceName,
  }: {
    resourceName: string;
  }): Promise<chat_v1.Schema$Media> => {
    const url = `https://chat.googleapis.com/v1/media/${resourceName}`;

    return this.api(url); // TODO: Check response
  };

  getSpace = async (
    args:
      | {
          name: string;
        }
      | { space: string }
  ): Promise<chat_v1.Schema$Space> => {
    const url =
      "name" in args
        ? `https://chat.googleapis.com/v1/${args.name}`
        : `https://chat.googleapis.com/v1/spaces/${args.space}`;

    return this.api(url);
  };

  listSpaces = async (
    _: undefined,
    { pageSize, pageToken }: { pageSize?: number; pageToken?: string } = {}
  ): Promise<{ nextPageToken?: string; spaces: chat_v1.Schema$Space[] }> => {
    const urlSearchParams = new URLSearchParams({
      ...(pageSize !== undefined ? { pageSize: pageSize.toString() } : {}),
      ...(pageToken !== undefined ? { pageToken } : {}),
    });
    const url = new URL("https://chat.googleapis.com/v1/spaces");
    url.search = urlSearchParams.toString();

    return this.api(url.toString());
  };

  getMember = async (
    args: { name: string } | { space: string; member: string }
  ): Promise<chat_v1.Schema$Membership> => {
    const url =
      "name" in args
        ? `https://chat.googleapis.com/v1/${args.name}`
        : `https://chat.googleapis.com/v1/spaces/${args.space}/members/${args.member}`;

    return this.api(url);
  };

  listMembers = async (
    args: { parent: string } | { space: string },
    { pageSize, pageToken }: { pageSize?: number; pageToken?: string }
  ): Promise<{
    nextPageToken: string;
    memberships: chat_v1.Schema$Membership[];
  }> => {
    const urlSearchParams = new URLSearchParams({
      ...(pageSize !== undefined ? { pageSize: pageSize.toString() } : {}),
      ...(pageToken !== undefined ? { pageToken } : {}),
    });
    const url = new URL(
      "parent" in args
        ? `https://chat.googleapis.com/v1/${args.parent}/members`
        : `https://chat.googleapis.com/v1/spaces/${args.space}/members`
    );
    url.search = urlSearchParams.toString();

    return this.api(url.toString());
  };

  createMessage = async (
    args:
      | {
          parent: string;
        }
      | { space: string },
    { threadKey, requestId }: { threadKey?: string; requestId?: string } = {},
    message: chat_v1.Schema$Message
  ): Promise<chat_v1.Schema$Message> => {
    const urlSearchParams = new URLSearchParams({
      ...(threadKey !== undefined ? { threadKey } : {}),
      ...(requestId !== undefined ? { requestId } : {}),
    });
    let url = new URL(
      "parent" in args
        ? `https://chat.googleapis.com/v1/${args.parent}`
        : `https://chat.googleapis.com/v1/spaces/${args.space}/messages`
    );
    url.search = urlSearchParams.toString();

    return this.api(url.toString(), {
      method: "POST",
      body: JSON.stringify(message),
    });
  };

  deleteMessage = async (
    args:
      | {
          name: string;
        }
      | { space: string; message: string }
  ): Promise<{}> => {
    const url =
      "name" in args
        ? `https://chat.googleapis.com/v1/${args.name}`
        : `https://chat.googleapis.com/v1/spaces/${args.space}/messages/${args.message}`;

    return this.api(url, { method: "DELETE" });
  };

  getMessage = async (
    args:
      | {
          name: string;
        }
      | { space: string; message: string }
  ): Promise<chat_v1.Schema$Message> => {
    const url =
      "name" in args
        ? `https://chat.googleapis.com/v1/${args.name}`
        : `https://chat.googleapis.com/v1/spaces/${args.space}/messages/${args.message}`;

    return this.api(url);
  };

  updateMessage = async (
    args: // 'message.name' is almost certainly meant to be just 'name', so we handle both cases to be nice
    | {
          "message.name": string;
        }
      | { name: string }
      | { space: string; message: string },
    { updateMask }: { updateMask?: string } = {},
    message: chat_v1.Schema$Message
  ): Promise<chat_v1.Schema$Message> => {
    const urlSearchParams = new URLSearchParams({
      ...(updateMask !== undefined ? { updateMask } : {}),
    });
    const url = new URL(
      "message.name" in args
        ? `https://chat.googleapis.com/v1/${args["message.name"]}`
        : "name" in args
        ? `https://chat.googleapis.com/v1/${args.name}`
        : `https://chat.googleapis.com/v1/spaces/${args.space}/messages/${args.message}`
    );
    url.search = urlSearchParams.toString();

    return this.api(url.toString(), {
      method: "PUT",
      body: JSON.stringify(message),
    });
  };

  getAttachment = async (
    args:
      | {
          name: string;
        }
      | {
          space: string;
          message: string;
          attachment: string;
        }
  ): Promise<chat_v1.Schema$Attachment> => {
    const url =
      "name" in args
        ? `https://chat.googleapis.com/v1/${args.name}`
        : `https://chat.googleapis.com/v1/spaces/${args.space}/messages/${args.message}/attachments/${args.attachment}`;

    return this.api(url);
  };
}
