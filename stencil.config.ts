import { Config } from "@stencil/core";
import { sass } from "@stencil/sass";
import { postcss } from "@stencil/postcss";
import autoprefixer from "autoprefixer";
import postcssNested from "postcss-nested";

export const config: Config = {
  namespace: "useit",
  outputTargets: [
    {
      copy: [
        {
          src: "themes/*.css",
          dest: "../themes",
          warn: true
        }
      ],
      type: "dist"
    },
    {
      generateTypeDeclarations: true,
      type: "dist-custom-elements"
    },
    {
      copy: [
        {
          src: "themes/!*.{css}",
          dest: "themes",
          warn: true
        }
      ],
      type: "www",
      serviceWorker: null
    }
  ],
  plugins: [
    sass({
      includePaths: ["src/themes"]
    }),
    postcss({
      plugins: [autoprefixer(), postcssNested()]
    })
  ]
};
