// https://nextjs.org/docs/routing/dynamic-routes
import { useRouter } from "next/router";
import { map } from "lodash";
import { useMemo } from "react";
import { GetStaticPathsContext, GetStaticPropsContext } from "next";
import Container from "components/container";
import Layout from "components/layout";
import Head from "next/head";
import MappedTable from "components/mapped-table";
import Link from "next/link";
import Header from "components/header";
import {
  buildProvinceTreeByAreaId,
  getAllProvinces,
  getProvinceBySlug,
} from "lib/getProvinces";
import { SITE_DESCRIPTION, SITE_NAME } from "lib/constants";
import { BreadCrumb } from "components/BreadCrumb";
import { Area } from "lib/prisma";
import { readdirSync } from "fs";
import { join } from "path";
// import { copyDB } from "lib/copyDB";

// https://github.com/vercel/next.js/discussions/36096

const LinkOrText = ({ propertyName, value, item }) => {
  const router = useRouter();
  return propertyName === "id" && item.hasChildren ? (
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

// awaited
// type Props = Awaited<ReturnType<typeof getStaticProps>>["props"];

type Props = {
  data:
    | (Area & {
        hasChildren: boolean;
      })[]
    | null;
  path: Area[];
  d: any;
};

export default function Province({ d, data, path }: Props) {
  const router = useRouter();

  const namePath = useMemo(() => map(path, "name"), []);

  const BreadCrumbItems =
    path?.map((e) => ({
      key: e.id,
      name: e.name,
    })) || [];

  if (!data) {
    return null;
  }

  return (
    /* @ts-ignore */
    <Layout>
      {/* @ts-ignore */}
      <Head>
        <title>{`${namePath.join("/")}-${SITE_NAME}`}</title>
        <meta name="description" content={SITE_DESCRIPTION} />
      </Head>
      {/* @ts-ignore */}
      <Container>
        <Header />
        {JSON.stringify(d)}
        <main className="space-y-4">
          <nav className="flex my-4" aria-label="Breadcrumb">
            {
              <BreadCrumb
                items={BreadCrumbItems}
                rootSlug={router.query.slug as string}
              />
            }
          </nav>
          <div className="text-gray-900 bg-white rounded-lg border border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            <MappedTable
              customCell={LinkOrText}
              data={data}
              propertyNames={["id", "name", "categoryCode"]}
            />
          </div>
        </main>
      </Container>
    </Layout>
  );
}

export async function getStaticProps(context: GetStaticPropsContext) {
  const { params } = context;
  const { slug, node } = params;

  const areaId = node || (await getProvinceBySlug(slug))?.id;
  if (!areaId) {
    throw Error("没有数据");
  }

  // 这个树太大了，不要把全省的数据都查出来构建
  const tree = await buildProvinceTreeByAreaId(areaId);

  if (!tree) {
    throw Error("没有数据");
  }

  const { path, data } = await tree.get(node || tree.value.id);

  if (!path) {
    console.log(888, node, slug);
  }

  const d1 = join(process.cwd(), "_provinces");
  // 得写这一句，不然 db 会丢掉
  const d2 = join(process.cwd(), "tmp");

  return {
    props: {
      path,
      data,
      d: [readdirSync(process.cwd()), readdirSync(d1), readdirSync(d2)],
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
