import Link from "next/link";
import { getAllProvinces, getProvinceBySlug } from "../../../lib/getProvinces";
import { getPath2Area } from "../../../lib/getPath2Area";
import { getFragment } from "../../../lib/getFragment";
import { join } from "path";
import AreaTable from "../../../components/AreaTable";
import { notFound } from "next/navigation";
import { SITE_NAME } from "../../../lib/constants";
import JsonLd from '../../../components/JsonLd';
import { Metadata } from "next";
import Container from "components/container";
import { BreadCrumb } from "components/BreadCrumb";

type Params = Promise<{
  slug: string;
}>

// 为省份详情页面生成动态metadata
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const province = await getProvinceBySlug(slug);
    const path = await getPath2Area(province?.id || "");

    if (!province) {
      return {
        title: `页面不存在 - ${SITE_NAME}`,
        description: '抱歉，您访问的省份页面不存在或已被移除',
      };
    }

    const provinceName = path.map(e => e.name).join("") || province.name;

    const description = `${provinceName}行政区划详情页面，提供${province.name}的详细行政区划数据，包括市、县、乡镇等层级信息`;
    const abstract = `${provinceName}是中华人民共和国省级行政区划单位，包含多个市、县、乡镇等层级。本页面提供${provinceName}的详细行政区划数据，包括${provinceName}的市、县、乡镇等层级信息。`;
    return {
      title: `${provinceName} - 行政区划详情 - ${SITE_NAME}`,
      abstract: abstract,
      description: `${provinceName}行政区划详情页面，提供${provinceName}的详细行政区划数据，包括市、县、乡镇等层级信息`,
      keywords: [`${provinceName}`, `${provinceName}行政区划`, `${provinceName}地图`, `${provinceName}市县`, `${provinceName}乡镇`],
      openGraph: {
        title: `${provinceName} - 行政区划详情 - ${SITE_NAME}`,
        description: description,
        images: [
          {
            url: `https://og-image.vercel.app/${encodeURIComponent(provinceName)}行政区划.png?theme=light&md=1&fontSize=100px`,
            width: 1200,
            height: 630,
            alt: `${provinceName}行政区划详情`,
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


// 客户端组件，替代原来的LinkOrText
export const LinkOrText = ({ slug, propertyName, value, item }: {
  slug: string;
  propertyName: string;
  value: any;
  item: { id: string; hasChildren: boolean };
}) => {
  // 简化的链接处理，不依赖路由参数
  return ["name", "id"].some((e) => propertyName == e) && item.hasChildren ? (
    <Link
      href={`/provinces/${slug}/${item.id}`}
      className="font-medium text-blue-600 hover:underline"
    >
      {value}
    </Link>
  ) : (
    value
  );
};

// 页面组件
export default async function ProvincePage({ params }: { params: Params }) {
  const meta = await generateMetadata({ params });
  const { slug } = await params;
  try {
    const areaId: string | null = (await getProvinceBySlug(slug))?.id || null;

    if (!areaId) {
      notFound();
    }

    const data = await getFragment(areaId);
    const path = await getPath2Area(areaId);

    if (!path.length) {
      notFound();
    }

    // 保持与原代码相同的逻辑
    const d2 = join(process.cwd(), "data");
    console.log(d2);

    const BreadCrumbItems =
      path?.map((e) => ({
        key: e.id,
        name: e.name,
      })) || [];


    // 获取根节点的slug（这应该从父组件传入，但为了保持兼容性暂时这样处理）
    const rootSlug = slug;

    // 返回页面内容，包含AreaTable和JSON-LD结构化数据
    return (
      <>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Place",
            "name": path[path.length - 1].name,
            "description": `${path[path.length - 1].name}行政区划详情页面`,
            "containedInPlace": path.length > 1 ? {
              "@type": "AdministrativeArea",
              "name": path[0].name
            } : undefined
          }}
        />

        {/* 面包屑导航 - 语义化导航结构 */}
        <Container>
          <nav className="flex my-4" aria-label="面包屑导航">
            <BreadCrumb
              items={BreadCrumbItems}
              rootSlug={rootSlug}
            />
          </nav>
          <h1 className="text-2xl md:text-3xl font-bold">{path[path.length - 1].name}</h1>

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
          </main>
        </Container>
      </>
    );
  } catch (error) {
    notFound();
  }
}

// 在App Router中，generateStaticParams替代getStaticPaths
export async function generateStaticParams() {
  const data = await getAllProvinces();
  const hasDataProvinces = data.filter(({ content }) => !!content);

  return hasDataProvinces.map((e) => ({
    slug: e.slug,
  }));
}
