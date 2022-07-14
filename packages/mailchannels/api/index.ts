interface EmailAddress {
  email: string;
  name?: string;
}

export interface Personalization {
  to: [EmailAddress, ...EmailAddress[]];
  from?: EmailAddress;
  dkim_domain?: string;
  dkim_private_key?: string;
  dkim_selector?: string;
  reply_to?: EmailAddress;
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  subject?: string;
  headers?: Record<string, string>;
}

export interface ContentItem {
  type: string;
  value: string;
}

export interface MailSendBody {
  personalizations: [Personalization, ...Personalization[]];
  from: EmailAddress;
  reply_to?: EmailAddress;
  subject: string;
  content: [ContentItem, ...ContentItem[]];
  headers?: Record<string, string>;
}

interface Success {
  success: true;
}

interface Failure {
  success: false;
  errors: string[];
}

export const sendEmail = async (
  payload: MailSendBody
): Promise<Success | Failure> => {
  const response = await fetch("https://api.mailchannels.net/tx/v1/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (response.status === 202) return { success: true };

  try {
    const { errors } = await response.clone().json();
    return { success: false, errors };
  } catch {
    return { success: false, errors: [response.statusText] };
  }
};
