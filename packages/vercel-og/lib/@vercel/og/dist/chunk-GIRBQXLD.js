// src/emoji/index.ts
var U200D = String.fromCharCode(8205);
var UFE0Fg = /\uFE0F/g;
function getIconCode(char) {
  return toCodePoint(char.indexOf(U200D) < 0 ? char.replace(UFE0Fg, "") : char);
}
function toCodePoint(unicodeSurrogates) {
  var r = [], c = 0, p = 0, i = 0;
  while (i < unicodeSurrogates.length) {
    c = unicodeSurrogates.charCodeAt(i++);
    if (p) {
      r.push((65536 + (p - 55296 << 10) + (c - 56320)).toString(16));
      p = 0;
    } else if (55296 <= c && c <= 56319) {
      p = c;
    } else {
      r.push(c.toString(16));
    }
  }
  return r.join("-");
}
var apis = {
  twemoji: (code) => "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/" + code.toLowerCase() + ".svg",
  openmoji: "https://cdn.jsdelivr.net/npm/@svgmoji/openmoji@2.0.0/svg/",
  blobmoji: "https://cdn.jsdelivr.net/npm/@svgmoji/blob@2.0.0/svg/",
  noto: "https://cdn.jsdelivr.net/gh/svgmoji/svgmoji/packages/svgmoji__noto/svg/",
  fluent: (code) => "https://cdn.jsdelivr.net/gh/shuding/fluentui-emoji-unicode/assets/" + code.toLowerCase() + "_color.svg",
  fluentFlat: (code) => "https://cdn.jsdelivr.net/gh/shuding/fluentui-emoji-unicode/assets/" + code.toLowerCase() + "_flat.svg"
};
function loadEmoji(code, type) {
  if (!type || !apis[type]) {
    type = "twemoji";
  }
  const api = apis[type];
  if (typeof api === "function") {
    return fetch(api(code));
  }
  return fetch(`${api}${code.toUpperCase()}.svg`);
}

// src/og.ts
var languageFontMap = {
  "ja-JP": "Noto+Sans+JP",
  "ko-KR": "Noto+Sans+KR",
  "zh-CN": "Noto+Sans+SC",
  "zh-TW": "Noto+Sans+TC",
  "zh-HK": "Noto+Sans+HK",
  "th-TH": "Noto+Sans+Thai",
  "bn-IN": "Noto+Sans+Bengali",
  "ar-AR": "Noto+Sans+Arabic",
  "ta-IN": "Noto+Sans+Tamil",
  "ml-IN": "Noto+Sans+Malayalam",
  "he-IL": "Noto+Sans+Hebrew",
  "te-IN": "Noto+Sans+Telugu",
  devanagari: "Noto+Sans+Devanagari",
  kannada: "Noto+Sans+Kannada",
  symbol: ["Noto+Sans+Symbols", "Noto+Sans+Symbols+2"],
  math: "Noto+Sans+Math",
  unknown: "Noto+Sans"
};
async function loadGoogleFont(font, text) {
  if (!font || !text)
    return;
  const API = `https://fonts.googleapis.com/css2?family=${font}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(API, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1"
    }
  })).text();
  const resource = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/);
  if (!resource)
    throw new Error("Failed to load font");
  return fetch(resource[1]).then((res) => res.arrayBuffer());
}
var assetCache = /* @__PURE__ */ new Map();
var loadDynamicAsset = ({ emoji }) => {
  const fn = async (code, text) => {
    if (code === "emoji") {
      return `data:image/svg+xml;base64,` + btoa(await (await loadEmoji(getIconCode(text), emoji)).text());
    }
    if (!languageFontMap[code])
      code = "unknown";
    try {
      const data = await loadGoogleFont(languageFontMap[code], text);
      if (data) {
        return {
          name: `satori_${code}_fallback_${text}`,
          data,
          weight: 400,
          style: "normal"
        };
      }
    } catch (e) {
      console.error("Failed to load dynamic font for", text, ". Error:", e);
    }
  };
  return async (...args) => {
    const key = JSON.stringify(args);
    const cache = assetCache.get(key);
    if (cache)
      return cache;
    const asset = await fn(...args);
    assetCache.set(key, asset);
    return asset;
  };
};
async function render(satori, resvg, opts, defaultFonts, element) {
  const options = Object.assign({
    width: 1200,
    height: 630,
    debug: false
  }, opts);
  const svg = await satori(element, {
    width: options.width,
    height: options.height,
    debug: options.debug,
    fonts: options.fonts || defaultFonts,
    loadAdditionalAsset: loadDynamicAsset({
      emoji: options.emoji
    })
  });
  const resvgJS = new resvg.Resvg(svg, {
    fitTo: {
      mode: "width",
      value: options.width
    }
  });
  return resvgJS.render().asPng();
}

export {
  render
};
/*! Copyright Twitter Inc. and other contributors. Licensed under MIT */
//# sourceMappingURL=chunk-GIRBQXLD.js.map