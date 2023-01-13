import { Config } from "@stencil/core";
import { postcss } from "@stencil/postcss";
import autoprefixer from "autoprefixer";
import postcssNested from "postcss-nested";

export const config: Config = {
  namespace: "inclusive-dates",
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
          src: "themes/*.{css,map}",
          dest: "themes",
          warn: true
        }
      ],
      type: "www",
      serviceWorker: null
    }
  ],
  plugins: [
    postcss({
      plugins: [autoprefixer(), postcssNested()]
    })
  ]
};
