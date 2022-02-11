import pako from "pako";
import { join } from "path";
import { getAllProvinces, getProvinceBySlug } from "./lib/api.js";
import fs from "fs";

const allProvinces = getAllProvinces();
allProvinces.forEach(({ content, slug }) => {
  const data = pako.gzip(content);
  const path = join(process.cwd(), "_provinces", slug + ".gz");
  fs.writeFileSync(path, data);
});
