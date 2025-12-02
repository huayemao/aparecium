import fs from "fs";
import { buildProvinceTreeByAreaId, getProvinceBySlug } from "lib/getProvinces";
import { NextResponse } from "next/server";
import path from "path";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";

export async function GET(request: Request, { params }: { params: Params }) {
  const { slug } = params;
  const str = path.join(process.cwd(), "data", "dev.db");

  return NextResponse.json({
    dir: fs.readdirSync(process.cwd()),
    dr1: fs.readdirSync(path.join(process.cwd(), "data")),
    dr2: fs.readdirSync(path.join(process.cwd(), "..")),
    dr3: fs.readdirSync(path.join(process.cwd(), "..", "..")),
    dr4: fs.readdirSync(path.join("/")),
  });
}