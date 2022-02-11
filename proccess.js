import pako from "pako";
import { join } from "path";
import { getAllProvincesRaw } from "./lib/provinceApi.js";
import fs from "fs";

const allProvinces = getAllProvincesRaw();
allProvinces.forEach(({ content, slug }) => {
  const data = pako.gzip(content);
  const path = join(process.cwd(), "_provinces", slug + ".gz");
  fs.writeFileSync(path, data);
});
