import fs from "fs";
import { join } from "path";
import matter from "gray-matter";
import Pako from "pako";

const postsDirectory = join(process.cwd(), "_posts");
const provincesDirectory = join(process.cwd(), "_provinces");

export function getPostSlugs() {
  return fs.readdirSync(postsDirectory);
}

export function getProvinceSlugs() {
  return fs.readdirSync(provincesDirectory);
}

export function getPostBySlug(slug, fields = []) {
  const realSlug = slug.replace(/\.md$/, "");
  const fullPath = join(postsDirectory, `${realSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  const items = {};

  // Ensure only the minimal needed data is exposed
  fields.forEach((field) => {
    if (field === "slug") {
      items[field] = realSlug;
    }
    if (field === "content") {
      items[field] = content;
    }

    if (typeof data[field] !== "undefined") {
      items[field] = data[field];
    }
  });

  return items;
}

export function getProvinceBySlugRaw(slug, fields = []) {
  const realSlug = slug.replace(/\.json$/, "");
  const fullPath = join(provincesDirectory, `${realSlug}.json`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  return { content: fileContents, slug: realSlug };
}

export function getProvinceBySlug(slug, fields = []) {
  const realSlug = slug.replace(/\.gz$/, "");
  const fullPath = join(provincesDirectory, `${realSlug}.gz`);
  const fileContents = fs.readFileSync(fullPath);
  return {
    content: Pako.inflate(fileContents, { to: "string" }),
    slug: realSlug,
  };
}

export function getAllPosts(fields = []) {
  const slugs = getPostSlugs();
  const posts = slugs
    .map((slug) => getPostBySlug(slug, fields))
    // sort posts by date in descending order
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
  return posts;
}

export function getAllProvinces(fields = []) {
  const slugs = getProvinceSlugs();
  const provinces = slugs.map((slug) => getProvinceBySlug(slug, fields));
  // sort posts by date in descending order
  return provinces;
}

export function getAllProvincesRaw(fields = []) {
  const slugs = getProvinceSlugs();
  const provinces = slugs.map((slug) => getAllProvincesRaw(slug, fields));
  // sort posts by date in descending order
  return provinces;
}
