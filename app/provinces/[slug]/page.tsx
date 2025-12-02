import Link from "next/link";
import { getAllProvinces, getProvinceBySlug } from "../../../lib/getProvinces";
import { getPath2Area } from "../../../lib/getPath2Area";
import { getFragment } from "../../../lib/getFragment";
import { join } from "path";
import AreaTable from "../../../components/AreaTable";
import { notFound } from "next/navigation";

// 在App Router中，LinkOrText需要是客户端组件，因为它使用了客户端功能
'use client';

// 客户端组件，替代原来的LinkOrText
export const LinkOrText = ({ propertyName, value, item }: {
  propertyName: string;
  value: any;
  item: { id: string; hasChildren: boolean };
}) => {
  // 简化的链接处理，不依赖路由参数
  return ["name", "id"].some((e) => propertyName == e) && item.hasChildren ? (
    <Link
      href={`#${item.id}`} // 使用锚点链接
      className="font-medium text-blue-600 hover:underline"
    >
      {value}
    </Link>
  ) : (
    value
  );
};

// 页面组件
export default async function ProvincePage({ params }: { params: { slug: string } }) {
  try {
    const areaId: string | null = (await getProvinceBySlug(params.slug))?.id || null;

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

    // 返回AreaTable组件，并传入必要的props
    return (
      <AreaTable 
        path={path} 
        data={data}
        customCell={LinkOrText}
      />
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
