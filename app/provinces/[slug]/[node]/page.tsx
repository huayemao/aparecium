import { getPath2Area, parseLevel } from "../../../../lib/getPath2Area";
import { getFragment } from "../../../../lib/getFragment";
import AreaTable from "../../../../components/AreaTable";
import { notFound } from "next/navigation";
import { SITE_NAME } from "../../../../lib/constants";
import prisma from "../../../../lib/prisma";
import JsonLd from "../../../../components/JsonLd";
import { LinkOrText } from "../page";
import Container from "../../../../components/container";
import { BreadCrumb } from "../../../../components/BreadCrumb";
import Link from "next/link";
import { getProvinceInfoBySlug, getAllProvinces } from "../../../../lib/getProvinces";
import { getIsoCodeByNumericPrefix } from "@/lib/utils/getIsoCodeByNumericPrefix";

type Params = Promise<{
  slug: string;
  node: string;
}>;

// 为嵌套的省份节点页面生成动态metadata
export async function generateMetadata({ params }: { params: Params }) {
  try {
    const { node } = await params;
    const area = await prisma.area.findUnique({ where: { id: node } });
    const path = await getPath2Area(area?.id || "");

    if (!area) {
      return {
        title: `区域不存在 - ${SITE_NAME}`,
        description: "抱歉，您访问的区域页面不存在或已被移除",
      };
    }

    const areaName = path.map((e) => e.name).join("") || area.name;

    // 根据行政区划级别动态生成描述
    const level = parseLevel(node);
    const areaTypeMap = [
      "省级行政区划单位",
      "市级行政区划单位",
      "县级行政区划单位",
      "乡镇级行政区划单位",
      "村级行政区划单位",
    ];
    const areaType = areaTypeMap[level] || "行政区划单位";

    // 根据不同行政区划级别生成不同描述
    let abstract;
    if (level === 4) { // 村级行政区划单位（村委会）
      abstract = `${areaName}是中华人民共和国${areaType}，属于行政区划体系的最基层单位。本页面提供${areaName}所在行政区域内同级行政区划的详细数据。`;
    } else {
      abstract = `${areaName}是中华人民共和国${areaType}，包含多个下属行政区划层级。本页面提供${areaName}的详细行政区划数据。`;
    }

    return {
      title: `${areaName} - 行政区划详情 - ${SITE_NAME}`,
      abstract: abstract,
      description: `${areaName}行政区划详情页面，提供${areaName}的详细行政区划数据和层级信息`,
      keywords: [
        `${areaName}`,
        `${areaName}`,
        `${areaName}行政区划`,
        `${areaName}地图`,
      ],
      openGraph: {
        title: `${areaName} - 行政区划详情 - ${SITE_NAME}`,
        description: `${areaName}行政区划详情页面，提供${areaName}的详细行政区划数据和层级信息`,
        images: [
          {
            url: `https://og-image.vercel.app/${encodeURIComponent(
              areaName
            )}行政区划.png?theme=light&md=1&fontSize=100px`,
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
      description: "抱歉，加载页面时发生错误",
    };
  }
}

// 嵌套动态路由页面组件
export default async function NestedProvincePage({
  params,
}: {
  params: Params;
}) {
  try {
    const { node, slug } = await params;

    // 生成元数据，用于获取abstract
    const meta = await generateMetadata({ params });

    if (!node) {
      notFound();
    }

    let data = await getFragment(node);
    if (!data) {
      const parentNode = node.slice(0, -3) + "000";
      console.log(parentNode);
      data = await getFragment(parentNode);
      if (!data) {
        notFound();
      }
    }
    const path = await getPath2Area(node);

    if (!path.length) {
      notFound();
    }

    // 获取当前区域信息用于JSON-LD
    const currentArea = path[path.length - 1];

    // 生成面包屑导航项
    const BreadCrumbItems =
      path?.map((e) => ({
        key: e.id,
        name: e.name,
      })) || [];

    // 返回包含JSON-LD结构化数据的页面
    return (
      <>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Place",
            name: `${currentArea.name}`,
            description: `${currentArea.name}行政区划详情`,
            additionalType: "https://schema.org/AdministrativeArea",
          }}
        />
        <Container>
          <nav className="flex my-4" aria-label="面包屑导航">
            <BreadCrumb items={BreadCrumbItems} rootSlug={slug} />
          </nav>
          <h1 className="text-2xl md:text-3xl font-bold">{currentArea.name}</h1>

          <main className="space-y-6">
            {meta.abstract && (
              <p className="text-gray-600 dark:text-gray-400">
                {meta.abstract}
              </p>
            )}
            <AreaTable
              slug={slug}
              path={path}
              data={data}
              customCell={(props) => LinkOrText({ ...props, slug })} // 类型断言以避免TypeScript错误
            />

            {/* 更多阅读部分 */}
            <section className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4">更多阅读</h2>
              <div className="space-y-2">
                {(() => {
                  // 获取当前省份的ISO代码
                  // 参考 /C:/Users/huaye/workspace/aparecium/app/provinces/[slug]/page.tsx#L161-162
                  const provinceInfo = getProvinceInfoBySlug(slug);
                  if (provinceInfo) {
                    return (
                      <p>
                        <Link
                          href={`https://uni.utities.online/${provinceInfo.ISO}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                        >
                          {provinceInfo.title.split(" ")[0]}重点大学名单
                        </Link>
                      </p>
                    );
                  }
                  return null;
                })()}
              </div>
            </section>
          </main>
        </Container>
      </>
    );
  } catch (error) {
    notFound();
  }
}

// 为嵌套的省份节点页面生成静态路径
export async function generateStaticParams() {
  // 查询数据库中所有id以00000000结尾的area记录
  const areas = await prisma.area.findMany({
    where: { id: { endsWith: '00000000' } },
    select: { id: true }
  });

  // 查询所有省份数据（id以000000结尾）
  const provinces = await prisma.area.findMany({
    where: { id: { endsWith: '000000' } },
    select: { id: true }
  });



  // 生成静态路径并应用隔3跳1的过滤
  const paths = areas
    .map(area => {
      const provincePrefix = area.id.slice(0, 2);
      const isoCode = getIsoCodeByNumericPrefix(provincePrefix);
      return isoCode ? { slug: isoCode, node: area.id } : null;
    })
    .filter((path, index) => path && Math.floor(index / 3) !== index / 3)
    .filter(Boolean) as { slug: string; node: string }[];

  return paths;
}
