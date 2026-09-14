import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import { fileURLToPath, URL } from "node:url";

const repositoryName = "the-night-letter-live";
const pagesBasePath = `/${repositoryName}`;

/**
 * Runtime image/audio paths intentionally stay root-relative in the performance
 * player. GitHub Pages serves a project below /the-night-letter-live, so the
 * Pages-only build prefixes those URLs without changing local or Sites builds.
 */
function prefixPublicAssetPaths(): Plugin {
  const publicPathPattern = /(["'])\/(images|audio|video)\//g;

  return {
    name: "prefix-public-asset-paths-for-github-pages",
    enforce: "pre",
    transform(source, id) {
      if (!/\.(?:ts|tsx)$/.test(id)) return null;
      const code = source.replace(
        publicPathPattern,
        `$1${pagesBasePath}/$2/`,
      );
      return code === source ? null : { code, map: null };
    },
  };
}

export default defineConfig({
  root: fileURLToPath(new URL("./github-pages", import.meta.url)),
  base: `${pagesBasePath}/`,
  publicDir: fileURLToPath(new URL("./public", import.meta.url)),
  plugins: [prefixPublicAssetPaths(), react()],
  build: {
    outDir: fileURLToPath(new URL("./dist-pages", import.meta.url)),
    emptyOutDir: true,
  },
});
