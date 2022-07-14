import type { chat_v1 } from "@googleapis/chat";

type EventHandler = (
  event: chat_v1.Schema$DeprecatedEvent
) => Promise<chat_v1.Schema$Message | undefined>;

export type PluginArgs =
  | EventHandler
  | { aud: string; handleEvent: EventHandler };

export default function (args: PluginArgs): PagesFunction;
