import Container from "../components/container";
import Intro from "../components/intro";
import Layout from "../components/layout";
import { getAllProvinces } from "../lib/provinceApi";
import Head from "next/head";
import { CMS_NAME } from "../lib/constants";
import Link from "next/link";
import cn from "classnames";

export default function Index({ allProvinces }) {
  return (
    <>
      <Layout>
        <Head>
          <title>Aparecium {CMS_NAME}</title>
        </Head>
        <Container>
          <Intro />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-10">
            {allProvinces.map(({ slug, title, href, hasData }) =>
              hasData ? (
                <div
                  key={slug}
                  className="block p-6 max-w-sm bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
                >
                  <Link href={`/provinces/${slug}`}>
                    <a>
                      <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                        {title}
                      </h5>
                    </a>
                  </Link>
                  <p className="font-normal text-sm text-gray-600 dark:text-gray-400 truncate">
                    数据来源：
                    <a
                      // style={{ overflowWrap: "anywhere" }}
                      className="underline"
                      href={href}
                    >
                      {href}
                    </a>
                  </p>
                </div>
              ) : (
                <div
                  key={slug}
                  className="block p-6 max-w-sm bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
                >
                  <a>
                    <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                      {title}
                    </h5>
                  </a>
                  <p className="font-normal text-sm text-gray-600 dark:text-gray-400 truncate">
                    暂无数据
                  </p>
                </div>
              )
            )}
          </div>
        </Container>
      </Layout>
    </>
  );
}

export async function getStaticProps() {
  const data = getAllProvinces();

  return {
    props: {
      allProvinces: data.map(({ content, Chinese_Hanyu_Pinyin, ...rest }) => {
        const hasData = !!content;
        const title = Chinese_Hanyu_Pinyin;
        return hasData
          ? {
              ...rest,
              title,
              hasData,
              href: JSON.parse(content).href,
            }
          : { ...rest, title, hasData };
      }),
    },
  };
}
