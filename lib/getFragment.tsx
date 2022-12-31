import prisma from "lib/prisma";
import { Tree } from "lib/model/Tree";

export async function getFragment(areaId: string) {
  const records = await prisma.area.findMany({
    where: {
      // OR 似乎必须写成数组？
      OR: [
        {
          id: areaId,
        },
        {
          parentId: areaId,
        },
      ],
    },
  });

  const children = await prisma.area.findMany({
    where: {
      // OR 似乎必须写成数组？
      parentId: {
        in: records.filter((r) => r.id !== areaId).map((e) => e.id),
      },
    },
  });

  const tree = Tree.from([...records, ...children], areaId);

  if (!tree) {
    throw Error("没有数据");
  }

  // todo: 如果访问最后一级呢
  const { data } = await tree.get(areaId || tree.value.id);
  return data;
}
