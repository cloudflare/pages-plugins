import staticFormPlugin from "@cloudflare/pages-plugin-static-forms";
import type { PluginArgs, Submission } from "..";
import { MailSendBody, sendEmail } from "../api";

type MailChannelsPagesPluginFunction<
  Env = unknown,
  Params extends string = any,
  Data extends Record<string, unknown> = Record<string, unknown>,
> = PagesPluginFunction<Env, Params, Data, PluginArgs>;

const textPlainContent = ({ request, formData, name }: Submission) => {
  return `At ${new Date().toISOString()}, you received a new ${name} form submission from ${request.headers.get(
    "CF-Connecting-IP",
  )}:

${[...formData.entries()]
  .map(
    ([field, value]) => `${field}
${value}
`,
  )
  .join("\n")}`;
};

const textHTMLContent = ({ request, formData, name }: Submission) => {
  return `<!DOCTYPE html>
  <html>
    <body>
      <h1>New contact form submission</h1>
      <div>At ${new Date().toISOString()}, you received a new ${name} form submission from ${request.headers.get(
        "CF-Connecting-IP",
      )}:</div>
      <table>
      <tbody>
      ${[...formData.entries()]
        .map(
          ([field, value]) =>
            `<tr><td><strong>${field}</strong></td><td>${value}</td></tr>`,
        )
        .join("\n")}
      </tbody>
      </table>
    </body>
  </html>`;
};

export const onRequest: MailChannelsPagesPluginFunction = async (context) => {
  const { request, pluginArgs } = context;

  return await staticFormPlugin({
    respondWith: async ({ formData, name }) => {
      const submission: Submission = { formData, name, request };

      const personalizations: MailSendBody["personalizations"] =
        typeof pluginArgs.personalizations === "function"
          ? pluginArgs.personalizations(submission)
          : pluginArgs.personalizations;

      const from: MailSendBody["from"] =
        typeof pluginArgs.from === "function"
          ? pluginArgs.from(submission)
          : pluginArgs.from;

      const subject: MailSendBody["subject"] =
        typeof pluginArgs.subject === "function"
          ? pluginArgs.subject(submission)
          : pluginArgs.subject || `New ${name} form submission`;

      // TODO: File attachments

      const content: MailSendBody["content"] = pluginArgs.content
        ? pluginArgs.content(submission)
        : [
            {
              type: "text/plain",
              value: textPlainContent(submission),
            },
            {
              type: "text/html",
              value: textHTMLContent(submission),
            },
          ];

      const { success } = await sendEmail({
        personalizations,
        from,
        subject,
        content,
      });
      if (success) {
        return pluginArgs.respondWith(submission);
      }

      return new Response(`Could not send your email. Please try again.`, {
        status: 512,
      });
    },
  })(context);
};
