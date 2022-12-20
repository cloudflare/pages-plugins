---
"@cloudflare/pages-plugin-cloudflare-access": patch
---

chore: Improve conversion from string to char array

This code was a bit hard to read and got typescript errors when copying to a Workers project. This improves the speed by 1.8X and makes the code easier to understand.
