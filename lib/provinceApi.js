import fs from "fs";
import { join } from "path";
import matter from "gray-matter";
import _ from "lodash";
import Pako from "pako";
import provinceMeta from "./province.json";

const { map } = _;

const provincesDirectory = join(process.cwd(), "_provinces");

export function getProvinceSlugs() {
  return map(provinceMeta, "ISO");
}

export function getProvinceSlugsRaw() {
  return fs.readdirSync(provincesDirectory).filter((e) => e.endsWith(".json"));
}

export function getProvinceBySlugRaw(slug, fields = []) {
  const realSlug = slug.replace(/\.json$/, "");
  const fullPath = join(provincesDirectory, `${realSlug}.json`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  return { content: fileContents, slug: realSlug };
}

export function getProvinceBySlug(slug, fields = []) {
  const fullPath = join(provincesDirectory, `${slug}.gz`);
  const fileContents = fs.readFileSync(fullPath);
  return Pako.inflate(fileContents, { to: "string" });
}

export function getAllProvinces(fields = []) {
  const slugs = getProvinceSlugs();
  const existingSlugs = fs
    .readdirSync(provincesDirectory)
    .map((e) => e.replace(".gz", ""));

  const provinces = slugs.map((slug) => {
    const metaData = provinceMeta.find(({ ISO }) => ISO === slug);
    const content = existingSlugs.includes(slug)
      ? getProvinceBySlug(slug, fields)
      : null;
    return { slug, ...metaData, content };
  });
  // sort posts by date in descending order
  return provinces;
}

export function getAllProvincesRaw(fields = []) {
  const slugs = getProvinceSlugsRaw();
  const provinces = slugs.map((slug) => getProvinceBySlugRaw(slug, fields));
  // sort posts by date in descending order
  return provinces;
}
