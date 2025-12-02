import {
  buildProvinceTreeByAreaId,
  getProvinceBySlug,
} from "lib/getProvinces";
import { NextResponse } from "next/server";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";

export async function GET(request: Request, { params }: { params: Params }) {
  const { node, slug } = params;
  
  const areaId = node || (await getProvinceBySlug(slug as string))?.id;
  if (!areaId) {
    return NextResponse.json({ error: "没有数据" }, { status: 404 });
  }
  
  const tree = await buildProvinceTreeByAreaId(areaId);
  
  if (!tree) {
    return NextResponse.json({ error: "没有数据" }, { status: 404 });
  }
  
  try {
    const { path, data } = await tree.get(node || tree.value.id);
    return NextResponse.json({ data, path });
  } catch (error) {
    return NextResponse.json({ error: "获取数据失败" }, { status: 500 });
  }
}