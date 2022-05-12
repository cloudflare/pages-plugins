import type { chat_v1 } from "@googleapis/chat";

export type PluginArgs = (
  event: chat_v1.Schema$DeprecatedEvent
) => Promise<chat_v1.Schema$Message | undefined>;

export default function (args: PluginArgs): PagesFunction;
