import {
  render
} from "./chunk-GIRBQXLD.js";

// src/index.edge.ts
import satori, { init as initSatori } from "satori/wasm";
import initYoga from "yoga-wasm-web";
import * as resvg from "@resvg/resvg-wasm";
import resvg_wasm from "./resvg.wasm";
import yoga_wasm from "./yoga.wasm";
import fallbackFont from './noto-sans-v27-latin-regular.ttf.bin';
var initializedResvg = resvg.initWasm(resvg_wasm);
var initializedYoga = initYoga(yoga_wasm).then((yoga) => initSatori(yoga));
var _a, _b;
var isDev = ((_b = (_a = globalThis == null ? void 0 : globalThis.process) == null ? void 0 : _a.env) == null ? void 0 : _b.NODE_ENV) === "development";
var ImageResponse = class {
  constructor(element, options = {}) {
    const result = new ReadableStream({
      async start(controller) {
        await initializedYoga;
        await initializedResvg;
        const fontData = await fallbackFont;
        const fonts = [
          {
            name: "sans serif",
            data: fontData,
            weight: 700,
            style: "normal"
          }
        ];
        const result2 = await render(satori, resvg, options, fonts, element);
        controller.enqueue(result2);
        controller.close();
      }
    });
    return new Response(result, {
      headers: {
        "content-type": "image/png",
        "cache-control": isDev ? "no-cache, no-store" : "public, immutable, no-transform, max-age=31536000",
        ...options.headers
      },
      status: options.status,
      statusText: options.statusText
    });
  }
};
export {
  ImageResponse
};
//# sourceMappingURL=index.edge.js.map