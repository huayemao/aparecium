// https://nextjs.org/docs/routing/dynamic-routes
import { useRouter } from "next/router";
import Link from "next/link";
import { getAllProvinces, getProvinceBySlug } from "lib/getProvinces";
import { GetStaticPropsContext } from "next";
import { getPath2Area } from "../../../lib/getPath2Area";
import { getFragment } from "../../../lib/getFragment";
import { join } from "path";
import AreaTable from "components/AreaTable";

// https://github.com/vercel/next.js/discussions/36096

export const LinkOrText = ({ propertyName, value, item }) => {
  const router = useRouter();
  return ["name", "id"].some((e) => propertyName == e) && item.hasChildren ? (
    <Link
      href={`/provinces/${router.query.slug}/${item.id}`}
      className="font-medium text-blue-600 hover:underline"
    >
      {value}
    </Link>
  ) : (
    value
  );
};

export default AreaTable;

export async function getStaticProps(context: GetStaticPropsContext) {
  const { params } = context;
  const { slug } = params;

  const areaId: string | null = (await getProvinceBySlug(slug))?.id || null;

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
  const data = await getAllProvinces();
  const hasDataProvinces = data.filter(({ content }) => !!content);

  const indexes = hasDataProvinces.map((e) => {
    return {
      params: {
        slug: e.slug,
        node: null,
      },
    };
  });

  return {
    paths: indexes,
    fallback: "blocking",
  };
}
