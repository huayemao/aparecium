import { getPath2Area } from "../../../../lib/getPath2Area";
import { getFragment } from "../../../../lib/getFragment";
import AreaTable from "../../../../components/AreaTable";
import { notFound } from "next/navigation";

// 重用相同的客户端组件LinkOrText
'use client';
import Link from "next/link";

// 客户端组件，替代原来的LinkOrText
export const LinkOrText = ({ propertyName, value, item }: {
  propertyName: string;
  value: any;
  item: { id: string; hasChildren: boolean };
}) => {
  // 从props中获取参数，而不是使用useParams
  return ["name", "id"].some((e) => propertyName == e) && item.hasChildren ? (
    <Link
      href={`#${item.id}`} // 简化的链接处理
      className="font-medium text-blue-600 hover:underline"
    >
      {value}
    </Link>
  ) : (
    value
  );
};

// 嵌套动态路由页面组件
export default async function NestedProvincePage({ params }: { params: { slug: string, node: string } }) {
  try {
    const areaId = params.node;

    if (!areaId) {
      notFound();
    }

    const data = await getFragment(areaId);
    const path = await getPath2Area(areaId);

    if (!path.length) {
      notFound();
    }

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

// 对于嵌套的动态路由，generateStaticParams可能需要更复杂的逻辑
// 这里暂时不实现，因为它可能需要递归地获取所有可能的节点
// 在实际应用中，可能需要根据具体的数据结构来实现
