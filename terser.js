const fs = require("fs");
const { sync } = require("glob");
const Terser = require("terser");

const files = sync("./docs-www/dist/**/*.js");

files.map(async (file) => {
  const terserResult = await Terser.minify(fs.readFileSync(file, "utf8"));

  if (terserResult.error) {
    console.log(`Minifying ${file} error.`, terserResult.error);
  } else {
    fs.writeFileSync(file, terserResult.code, "utf8");
  }
});
