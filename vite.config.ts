import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    solidPlugin(),
    dts({
      include: ["src/**/*"],
    }),
  ],
  build: {
    outDir: "dist",
    lib: {
      entry: "src/index.ts",
      fileName: "index",
      formats: ["es"],
    },
    rollupOptions: {
      external: ["solid-js", /^solid-js\//, "dockview-core"],
    },
    emptyOutDir: true,
  },
  server: {
    open: "/example/index.html",
  },
});
