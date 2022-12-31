import {
  buildProvinceTreeByAreaId,
  getProvinceBySlug,
} from "lib/getProvinces";
import { NextApiRequest, NextApiResponse } from "next";
import { join } from "path";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  const node = req.query.node;
  const slug = req.query.slug as string;
  const areaId = node || (await getProvinceBySlug(slug))?.id;
  if (!areaId) {
    throw Error("没有数据");
  }
  const tree = await buildProvinceTreeByAreaId(areaId);

  if (!tree) {
    throw Error("没有数据");
  }

  const { path, data } = await tree.get(node || tree.value.id);

  res.json({
    data,
    path,
  });
}
