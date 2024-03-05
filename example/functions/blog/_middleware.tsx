import vercelOGPagesPlugin from "@cloudflare/pages-plugin-vercel-og";

interface Props {
  ogTitle: string;
}

export const onRequest = vercelOGPagesPlugin<Props>({
  imagePathSuffix: "/social-image.png",
  component: ({ ogTitle, pathname }) => {
    return <div style={{ display: "flex" }}>{ogTitle}</div>;
  },
  extractors: {
    on: {
      'meta[property="og:title"]': (props) => ({
        element(element) {
          props.ogTitle = element.getAttribute("content");
        },
      }),
    },
  },
  autoInject: {
    openGraph: true,
  },
});
