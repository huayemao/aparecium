import { useRouter } from "next/router";
import { map } from "lodash";
import { useMemo } from "react";
import Container from "components/container";
import Layout from "components/layout";
import Head from "next/head";
import MappedTable from "components/mapped-table";
import Header from "components/header";
import { SITE_DESCRIPTION, SITE_NAME } from "lib/constants";
import { BreadCrumb } from "components/BreadCrumb";
import { Area } from "lib/prisma";
import { LinkOrText } from "../pages/provinces/[slug]";

// awaited
// type Props = Awaited<ReturnType<typeof getStaticProps>>["props"];
interface CustomCellProps {
  propertyName: string;
  value: any;
  item: Area & { hasChildren: boolean };
}

type CustomCellFunction = (props: CustomCellProps) => React.ReactNode;

type Props = {
  data:
    | (Area & {
        hasChildren: boolean;
      })[]
    | null;
  path: Area[];
  customCell?: CustomCellFunction;
};

export default function AreaTable({ data, path, customCell }: Props) {
  const router = useRouter();

  const namePath = useMemo(() => map(path, "name"), []);

  // 不清楚预渲染的时候这里为什么可能会是 undefined
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
