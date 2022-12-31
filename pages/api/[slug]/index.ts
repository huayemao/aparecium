import fs from "fs";
import { buildProvinceTreeByAreaId, getProvinceBySlug } from "lib/getProvinces";
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const node = req.query.node;
  const slug = req.query.slug as string;
  const str = path.join(process.cwd(), "tmp", "dev.db");

  res.json({
    dir: fs.readdirSync(process.cwd()),
    dr1: fs.readdirSync(path.join(process.cwd(), "tmp")),
    dr2: fs.readdirSync(path.join(process.cwd(), "..")),
    dr3: fs.readdirSync(path.join(process.cwd(), "..", "..")),
    dr4: fs.readdirSync(path.join("/")),
  });
}
