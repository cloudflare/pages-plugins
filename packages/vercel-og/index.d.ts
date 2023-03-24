import { ImageResponse } from "@vercel/og";
import { FunctionComponent } from "react";

type ProvidedProps = {
	pathname: string;
};

export type PluginArgs<Props extends {} = {}> = {
	imagePathSuffix: string;
	component: FunctionComponent<Props & ProvidedProps>;
	extractors?: {
		on?: Record<string, (props: Props) => HTMLRewriterElementContentHandlers>;
		onDocument?: (props: Props) => HTMLRewriterDocumentContentHandlers;
	};
	options?: ConstructorParameters<typeof ImageResponse>[1];
	onError?: () => Response | Promise<Response>;
	autoInject?: {
		openGraph?: boolean;
	};
};

export default function <Props extends {} = {}>(
	args: PluginArgs<Props>
): PagesFunction;
