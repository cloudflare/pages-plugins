import {
  render
} from "./chunk-GIRBQXLD.js";

// src/index.node.ts
import satoriMod, { init as initSatori } from "satori/wasm";
import initYoga from "yoga-wasm-web";
import * as resvg from "@resvg/resvg-wasm";
import { Readable } from "stream";
import fs from "fs";
import { fileURLToPath } from "url";
var satori = satoriMod.default || satoriMod;
var fontData = fs.readFileSync(fileURLToPath(`${import.meta.url}/../noto-sans-v27-latin-regular.ttf`));
var yoga_wasm = fs.readFileSync(fileURLToPath(`${import.meta.url}/../yoga.wasm`));
var resvg_wasm = fs.readFileSync(fileURLToPath(`${import.meta.url}/../resvg.wasm`));
var initializedResvg = resvg.initWasm(resvg_wasm);
var initializedYoga = initYoga(yoga_wasm).then((yoga) => initSatori(yoga));
var _a, _b;
var isDev = ((_b = (_a = globalThis == null ? void 0 : globalThis.process) == null ? void 0 : _a.env) == null ? void 0 : _b.NODE_ENV) === "development";
var ImageResponse = class {
  constructor(element, options = {}) {
    if (typeof Response === "undefined" || typeof ReadableStream === "undefined") {
      throw new Error("The `ImageResponse` API is not supported in this runtime, use the `unstable_createNodejsStream` API instead or switch to the Vercel Edge Runtime.");
    }
    const result = new ReadableStream({
      async start(controller) {
        await initializedYoga;
        await initializedResvg;
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
async function unstable_createNodejsStream(element, options = {}) {
  await initializedYoga;
  await initializedResvg;
  const fonts = [
    {
      name: "sans serif",
      data: fontData,
      weight: 700,
      style: "normal"
    }
  ];
  const result = await render(satori, resvg, options, fonts, element);
  return Readable.from(Buffer.from(result));
}
export {
  ImageResponse,
  unstable_createNodejsStream
};
//# sourceMappingURL=index.node.js.map