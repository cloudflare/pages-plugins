import type { MailSendBody } from "./api";

interface Submission {
  request: Request;
  formData: FormData;
  name: string;
}

export type PluginArgs = {
  personalizations:
    | MailSendBody["personalizations"]
    | ((submission: Submission) => MailSendBody["personalizations"]);
  from:
    | MailSendBody["from"]
    | ((submission: Submission) => MailSendBody["from"]);
  subject?:
    | MailSendBody["subject"]
    | ((submission: Submission) => MailSendBody["subject"]);
  content?: (submission: Submission) => MailSendBody["content"];
  respondWith: (submission: Submission) => Response | Promise<Response>;
};

export default function (args: PluginArgs): PagesFunction;
