---
"@cloudflare/pages-plugin-cloudflare-access": patch
"@cloudflare/pages-plugin-mailchannels": patch
"@cloudflare/pages-plugin-static-forms": patch
"@cloudflare/pages-plugin-google-chat": patch
"@cloudflare/pages-plugin-honeycomb": patch
"@cloudflare/pages-plugin-turnstile": patch
"@cloudflare/pages-plugin-vercel-og": patch
"@cloudflare/pages-plugin-hcaptcha": patch
"@cloudflare/pages-plugin-graphql": patch
"@cloudflare/pages-plugin-sentry": patch
"@cloudflare/pages-plugin-stytch": patch
---

chore: Now builds Plugin with `--outdir` option to ensure accompanying files are brought along

Plus, now builds any accompanying sources with esbuild so patches are applied.

And also updates `package.json` to be more complete.
