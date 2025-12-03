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
  return (


    <>
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
    </>
  );
}
