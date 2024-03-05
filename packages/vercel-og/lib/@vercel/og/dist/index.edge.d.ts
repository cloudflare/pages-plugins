import type { ReactElement } from "react";
import type { ImageResponseOptions } from "./types.ts";
export declare class ImageResponse extends Response {
  constructor(element: ReactElement, options?: ImageResponseOptions);
}
