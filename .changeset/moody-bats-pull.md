---
"@cloudflare/pages-plugin-vercel-og": patch
---

fix: `@cloudflare/pages-plugin-vercel-og/api` now should work properly

Previously, the `/api` wasn't bundled, so Wasm and font binaries weren't being brought along. This change now produces a bundle with these files.
