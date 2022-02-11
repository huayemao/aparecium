import Container from "../components/container";
import MoreStories from "../components/more-stories";
import HeroPost from "../components/hero-post";
import Intro from "../components/intro";
import Layout from "../components/layout";
import { getAllPosts, getAllProvinces } from "../lib/api";
import Head from "next/head";
import { CMS_NAME } from "../lib/constants";
import Link from "next/link";
import cn from "classnames";

export default function Index({ allPosts, allProvinces }) {
  const heroPost = allPosts[0];
  const morePosts = allPosts.slice(1);
  return (
    <>
      <Layout>
        <Head>
          <title>Aparecium {CMS_NAME}</title>
        </Head>
        <Container>
          <Intro />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-10">
            {allProvinces.map(({ slug, title, href }) => (
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
            ))}
          </div>
        </Container>
      </Layout>
    </>
  );
}

export async function getStaticProps() {
  const allPosts = getAllPosts([
    "title",
    "date",
    "slug",
    "author",
    "coverImage",
    "excerpt",
  ]);

  const data = getAllProvinces();

  return {
    props: {
      allPosts,
      allProvinces: data.map(({ slug, content }) => {
        const province = JSON.parse(content);
        return {
          slug,
          title: province.value,
          href: province.href,
        };
      }),
    },
  };
}
