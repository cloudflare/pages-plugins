export type PluginArgs = {
  respondWith: ({
    formData,
    name,
  }: {
    formData: FormData;
    name: string;
  }) => Response | Promise<Response>;
};

export default function (args: PluginArgs): PagesFunction;
