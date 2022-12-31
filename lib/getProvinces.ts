import _ from "lodash";
import provinceMeta from "./province.json" assert { type: "json" };
import prisma from "./prisma";
import { Area } from "./prisma";
import { Tree } from "./model/Tree";

const { map } = _;

export function getProvinceSlugs() {
  return map(provinceMeta, "ISO");
}

export async function getAllProvinces(fields = []) {
  const slugs = getProvinceSlugs();
  const provinces = await Promise.all(
    slugs.map(async (slug) => {
      const metaData = provinceMeta.find(({ ISO }) => ISO === slug);
      const content = await getProvince(slug);
      return { slug, ...metaData, content };
    })
  );
  // sort posts by date in descending order
  return provinces;
}

export const getProvince = async (slug) => {
  const provinceName = getProvinceNameBySlug(slug);

  const province = await prisma.area.findFirst({
    where: {
      name: provinceName,
    },
  });

  if (!province) {
    return null;
  }

  return await getAreasByProvinceId(province.id);
};

export const getProvinceTree = async (slug) => {
  const provinceName = getProvinceNameBySlug(slug);

  const province = await prisma.area.findFirst({
    where: {
      name: provinceName,
    },
  });

  if (!province) {
    return null;
  }

  const tree = buildTreeByProvinceId(province.id);
  return tree;
};

export function getProvinceNameBySlug(slug: any) {
  const obj = provinceMeta.find((e) => e.ISO === slug);
  if (!obj) {
    throw Error("未找到省份");
  }
  const provinceName = obj.title.split(" ")[0];
  return provinceName;
}

export async function buildTreeByProvinceId(id: string) {
  const items = await getAreasByProvinceId(id);

  const tree: Tree<Area> = Tree.from(items, id);
  return tree;
}

export async function getAreasByProvinceId(id: string) {
  const prefix = id.slice(0, 3);

  const items = await prisma.area.findMany({
    where: {
      id: { startsWith: prefix },
    },
    orderBy: {
      id: "asc",
    },
  });
  return items;
}
