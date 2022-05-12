## Pages Plugins

# MailChannels

This Plugin...TOOD

## Installation

```sh
npm install --save @cloudflare/pages-plugin-mailchannels
```

## Usage

```typescript
// ./functions/_middleware.ts

import mailChannelsPlugin from "@cloudflare/pages-plugin-mailchannels";

export const onRequest: PagesFunction = mailChannelsPlugin({
  "Access-Control-Allow-Origin": "*",
});
```
