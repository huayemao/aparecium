// https://nextjs.org/docs/routing/dynamic-routes
import { map } from "lodash";
import { getAllProvinces, getProvinceBySlug } from "lib/getProvinces";
import { join } from "path";
import { getPath2Area } from "../../../lib/getPath2Area";
import { getFragment } from "../../../lib/getFragment";
import AreaTable from ".";

// https://github.com/vercel/next.js/discussions/36096

export default AreaTable;

export async function getStaticProps(context: GetStaticPropsContext) {
  const { params } = context;
  const { slug, node } = params;

  const areaId: string | null =
    node || (await getProvinceBySlug(slug))?.id || null;

  if (!areaId) {
    throw Error("没有数据");
  }

  const data = await getFragment(areaId);
  const path = await getPath2Area(areaId);

  if (!path.length) {
    throw Error("数据错误");
  }

  // 得写这一句，不然 db 所在目录不会被包含到 runtime
  const d2 = join(process.cwd(), "tmp");
  console.log(d2);

  return {
    props: {
      path,
      data,
    },
  };
}

export async function getStaticPaths() {
  // copyDB();
  const data = await getAllProvinces();
  const hasDataProvinces = data.filter(({ content }) => !!content);
  const paths = hasDataProvinces.flatMap(({ content, slug }) => {
    return map(
      content?.filter((e) => e.id.endsWith("0000000000")),
      (e) => {
        return {
          params: {
            slug,
            node: e.id,
          },
        };
      }
    );
  });

  return {
    paths,
    fallback: true,
  };
}
