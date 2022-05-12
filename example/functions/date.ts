export const onRequest: PagesFunction = () =>
  new Response(new Date().toISOString());
