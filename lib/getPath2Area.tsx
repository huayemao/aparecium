import prisma from "lib/prisma";
import { Tree } from "lib/model/Tree";

export async function getPath2Area(areaId: string) {
  const parseLevel = (str: string) => {
    if (str.includes("0000000000")) {
      // 省
      return 0;
    } else if (str.includes("00000000")) {
      // 地
      return 1;
    } else if (str.includes("000000")) {
      // 县
      return 2;
    } else if (str.includes("000")) {
      // 乡
      return 3;
    }
    return 4;
  };

  const maskMapping = {
    0: "110000000000",
    1: "111100000000",
    2: "111111000000",
    3: "111111111000",
    4: "111111111111",
  };

  const mask = (source, maskCode) => {
    let newStr = "";
    for (let i = 0; i < source.length; i++) {
      const s = source[i];
      const x = maskCode[i];
      const modified = x === "1" ? s : "0";
      newStr += modified;
    }
    return newStr;
  };

  const level = parseLevel(areaId);
  const arr: number[] = Array.from({ length: level + 1 }, (e, i) => i);

  const ids = arr.map((number) => mask(areaId, maskMapping[number]));

  const records = await prisma.area.findMany({
    where: {
      OR: [
        {
          id: {
            in: ids,
          },
        },
        {
          parentId: {
            in: ids,
          },
        },
      ],
    },
    orderBy: {
      id: "asc",
    },
  });

  // 这里为啥要个 tree 呀
  const nodes = ids.map((id) => Tree.from(records, id));
  const path = nodes?.map((n) => n.value);

  return path;
}
