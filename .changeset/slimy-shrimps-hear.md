---
"@cloudflare/pages-plugin-vercel-og": patch
---

chore: Fix `@cloudflare/pages-plugin-vercel-og/api`.

Previously, the API wasn't built and the Wasm/binary files weren't being brought along. This change now produces a bundle with these files.
