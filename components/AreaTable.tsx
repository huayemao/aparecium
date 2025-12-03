import { map } from "lodash";
import { useMemo } from "react";
import Container from "components/container";
import MappedTable from "components/mapped-table";
import { BreadCrumb } from "components/BreadCrumb";
import { Area } from "lib/prisma";

// awaited
// type Props = Awaited<ReturnType<typeof getStaticProps>>["props"];
interface CustomCellProps {
  propertyName: string;
  value: any;
  item: Area & { hasChildren: boolean };
}

type CustomCell = React.FC<CustomCellProps>

type Props = {
  data:
  | (Area & {
    hasChildren: boolean;
  })[]
  | null;
  path: Area[];
  customCell?: CustomCell;
  slug: string;
};

export default function AreaTable({ slug, data, path, customCell }: Props) {
  const namePath = useMemo(() => map(path, "name"), []);

  // 生成面包屑导航项
  const BreadCrumbItems =
    path?.map((e) => ({
      key: e.id,
      name: e.name,
    })) || [];

  if (!data) {
    return (
      <Container>
        <div className="p-8 text-center">
          <p className="text-lg text-gray-600">暂无数据</p>
        </div>
      </Container>
    );
  }

  // 获取根节点的slug（这应该从父组件传入，但为了保持兼容性暂时这样处理）
  const rootSlug = slug;

  return (
    <Container>
      <main className="space-y-6">
        {/* 面包屑导航 - 语义化导航结构 */}
        <nav className="flex my-4" aria-label="面包屑导航">
          <BreadCrumb
            items={BreadCrumbItems}
            rootSlug={rootSlug}
          />
        </nav>

        {/* 区域标题 */}
        <h1 className="text-2xl md:text-3xl font-bold">{namePath.join(" / ")}</h1>

        {/* 表格容器 */}
        <section className="overflow-hidden rounded-lg border border-gray-200">
          <div className="bg-white dark:bg-gray-700">
            <h2 className="sr-only">区域数据表格</h2>
            <MappedTable
              customCell={customCell}
              data={data}
              propertyNames={["id", "name", "categoryCode"]}
            />
          </div>
        </section>
      </main>
    </Container>
  );
}
