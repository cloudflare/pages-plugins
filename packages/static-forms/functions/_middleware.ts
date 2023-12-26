import { PluginArgs } from "@cloudflare/pages-plugin-static-forms";

type StaticFormPagesPluginFunction<
  Env = unknown,
  Params extends string = any,
  Data extends Record<string, unknown> = Record<string, unknown>,
> = PagesPluginFunction<Env, Params, Data, PluginArgs>;

export const onRequestPost: StaticFormPagesPluginFunction = async ({
  request,
  next,
  pluginArgs,
}) => {
  let formData: FormData, name: string;
  try {
    formData = await request.formData();
    name = formData.get("static-form-name").toString();
  } catch {}

  if (name) {
    formData.delete("static-form-name");
    return pluginArgs.respondWith({ formData, name });
  }

  return next();
};

export const onRequestGet: StaticFormPagesPluginFunction = async ({ next }) => {
  const response = await next();

  return new HTMLRewriter()
    .on("form", {
      element(form) {
        if (form.hasAttribute("data-static-form-name")) {
          const formName = form.getAttribute("data-static-form-name");
          form.getAttribute("data-static-form-name");
          form.setAttribute("method", "POST");
          form.append(
            `<input type="hidden" name="static-form-name" value="${formName}" />`,
            { html: true },
          );
        }
      },
    })
    .transform(response);
};
