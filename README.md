# Pages Plugins

## Features

- 🥞 **Completely composable**

  You can include multiple Plugins, Plugins can rely on other Plugins, and they all share the same loading interface.

- ✍️ **Author a Plugin as a folder of Functions**

  The straight-forward syntax and intuitive file-based routing we've developed for Functions can be used to write Plugins.

- 📥 **Simple loading mechanism for including Plugins in projects**

  Mount the Plugin wherever you want and optionally pass it data.

- ⚡️ **Plugins can bring static assets**

  We hide static assets behind an inaccessible URL so they'll only be available in user-land where the Plugin exposes them.

## Usage

Check out our [Developer Docs](https://developers.cloudflare.com/pages/platform/functions/plugins/) for an example of creating and mounting a Pages Plugin.

## Plugins

Check out these examples:

- [Cloudflare Access](./packages/cloudflare-access)
- [Google Chat](./packages/google-chat)
- [GraphQL](./packages/graphql)
- [hCaptcha](./packages/hcaptcha)
- [Honeycomb](./packages/honeycomb)
- [Sentry](./packages/sentry)
- [Stytch](./packages/stytch)
- [Early hints](./packages/early-hints/)
