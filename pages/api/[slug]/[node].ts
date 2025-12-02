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

  const node = Array.isArray(req.query.node) ? req.query.node[0] : req.query.node;
  const slug = typeof req.query.slug === 'string' ? req.query.slug : (Array.isArray(req.query.slug) ? req.query.slug[0] : '');
  const areaId = node || (await getProvinceBySlug(slug))?.id;
  if (!areaId || typeof areaId !== 'string') {
    throw Error("没有数据");
  }
  const tree = await buildProvinceTreeByAreaId(areaId);

  if (!tree) {
    throw Error("没有数据");
  }

  const nodeParam = typeof node === 'string' ? node : tree.value.id;
  const { path, data } = await tree.get(nodeParam);

  res.json({
    data,
    path,
  });
}
