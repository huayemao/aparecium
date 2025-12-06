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
      const content = await getProvinceDataBySlug(slug);
      return { slug, ...metaData, content };
    })
  );
  // sort posts by date in descending order
  return provinces;
}

export const getProvinceDataBySlug = async (slug) => {
  const provinceName = getProvinceNameBySlug(slug);

  const province = await prisma.area.findFirst({
    where: {
      name: provinceName,
    },
  });

  if (!province) {
    return null;
  }

  return await getProvinceDataByAreaId(province.id);
};

export const getProvinceBySlug = async (slug) => {
  const provinceName = getProvinceNameBySlug(slug);

  const province = await prisma.area.findFirst({
    where: {
      name: provinceName,
    },
  });

  return province;
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

  const tree = buildProvinceTreeByAreaId(province.id);
  return tree;
};

export const getProvinceByName = async (slug) => {
  const provinceName = getProvinceNameBySlug(slug);

  console.log(provinceName);

  const province = await prisma.area.findFirst({
    where: {
      name: provinceName,
    },
  });

  return province;
};

export function getProvinceNameBySlug(slug: any) {
  const obj = provinceMeta.find((e) => e.ISO === slug);
  if (!obj) {
    throw Error("未找到省份");
  }
  const provinceName = obj.title.split(" ")[0];
  return provinceName;
}

// 获取省份信息
// 参考 /C:/Users/huaye/workspace/aparecium/app/provinces/[slug]/page.tsx#L161-162
// 这个函数可以在各处复用

export function getProvinceInfoBySlug(slug: string) {
  return provinceMeta.find(item => item.ISO === slug.toUpperCase());
}

export async function buildProvinceTreeByAreaId(id: string) {
  const items = await getProvinceDataByAreaId(id);

  // 这里保留 id 就变成 subTree 了
  const tree: Tree<Area> = Tree.from(items, items[0].id);
  return tree;
}

export async function getProvinceDataByAreaId(id: string) {
  const prefix = id.slice(0, 2);

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
