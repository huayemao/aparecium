import { getPath2Area } from "../../../../lib/getPath2Area";
import { getFragment } from "../../../../lib/getFragment";
import AreaTable from "../../../../components/AreaTable";
import { notFound } from "next/navigation";
import { SITE_NAME } from "../../../../lib/constants";
import prisma from "../../../../lib/prisma";
import JsonLd from "../../../../components/JsonLd";
import { LinkOrText } from "../page";

type Params = Promise<{
  slug: string;
  node: string;
}>

// 为嵌套的省份节点页面生成动态metadata
export async function generateMetadata({ params }: { params: Params }) {
  try {
    const { node } = await params;
    const area = await prisma.area.findUnique({ where: { id: node } });
    
    if (!area) {
      return {
        title: `区域不存在 - ${SITE_NAME}`,
        description: '抱歉，您访问的区域页面不存在或已被移除',
      };
    }
    
    const areaName = area.name;
    const areaType = area.categoryCode || '';

    
    return {
      title: `${areaName} - 行政区划详情 - ${SITE_NAME}`,
      description: `${areaName}行政区划详情页面，提供${areaName}的详细行政区划数据和层级信息`,
      keywords: [`${areaName}`, `${areaName}`, `${areaName}行政区划`, `${areaName}地图`],
      openGraph: {
        title: `${areaName} - 行政区划详情 - ${SITE_NAME}`,
        description: `${areaName}行政区划详情页面，提供${areaName}的详细行政区划数据和层级信息`,
        images: [
          {
            url: `https://og-image.vercel.app/${encodeURIComponent(areaName)}行政区划.png?theme=light&md=1&fontSize=100px`,
            width: 1200,
            height: 630,
            alt: `${areaName}行政区划详情`,
          },
        ],
      },
    };
  } catch (error) {
    return {
      title: `页面错误 - ${SITE_NAME}`,
      description: '抱歉，加载页面时发生错误',
    };
  }
}



// 嵌套动态路由页面组件
export default async function NestedProvincePage({ params }: { params: Params }) {
  try {
    const { node, slug } = await params;

    if (!node) {
      notFound();
    }

    const data = await getFragment(node);
    const path = await getPath2Area(node);

    if (!path.length) {
      notFound();
    }

    // 获取当前区域信息用于JSON-LD
    const currentArea = path[path.length - 1];

    // 返回包含JSON-LD结构化数据的页面
    return (
      <>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Place",
            "name": `${currentArea.name}`,
            "description": `${currentArea.name}行政区划详情`,
            "additionalType": "https://schema.org/AdministrativeArea"
          }}
        />
        <AreaTable 
          slug={slug}
          path={path} 
          data={data}
          customCell={(props) => LinkOrText({ ...props, slug })} // 类型断言以避免TypeScript错误
        />
      </>
    );
  } catch (error) {
    notFound();
  }
}

// 对于嵌套的动态路由，generateStaticParams可能需要更复杂的逻辑
// 这里暂时不实现，因为它可能需要递归地获取所有可能的节点
// 在实际应用中，可能需要根据具体的数据结构来实现
