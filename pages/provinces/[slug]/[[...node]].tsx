// https://nextjs.org/docs/routing/dynamic-routes
import { useRouter } from "next/router";
import { map } from "lodash";
import { useMemo } from "react";
import Container from "components/container";
import Layout from "components/layout";
import Head from "next/head";
import MappedTable from "components/mapped-table";
import Link from "next/link";
import Header from "components/header";
import { getAllProvinces, getProvinceTree } from "lib/getProvinces";
import { SITE_DESCRIPTION, SITE_NAME } from "lib/constants";
import { BreadCrumb } from "components/BreadCrumb";

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
type Props = Awaited<ReturnType<typeof getStaticProps>>["props"];

export default function Province({ data, path }: Props) {
  const router = useRouter();

  const namePath = useMemo(() => map(path, "name"), []);

  const BreadCrumbItems = path.map((e) => ({
    key: e.id,
    name: e.name,
  }));

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

export async function getStaticProps(context) {
  const { params } = context;
  const { slug, node: arr } = params;
  const [node] = arr || [];

  const tree = await getProvinceTree(slug);
  if (!tree) {
    throw Error("没有当前省份数据");
  }
  const { path, data } = await tree.get(node || tree.value.id);

  return {
    props: {
      data,
      path,
    },
  };
}

export async function getStaticPaths() {
  const data = await getAllProvinces();
  const hasDataProvinces = data.filter(({ content }) => !!content);
  const paths = hasDataProvinces.flatMap(({ content, slug }) => {
    return map(
      content?.filter((e) => e.id.endsWith("00000000")),
      (e) => {
        return {
          params: {
            slug,
            node: [e.id],
          },
        };
      }
    );
  });

  return {
    paths,
    fallback: "blocking",
  };
}
