import Container from "../components/container";
import Intro from "../components/intro";
import Layout from "../components/layout";
import { getAllProvinces } from "../lib/getProvinces";
import Head from "next/head";
import { CMS_NAME, SITE_NAME, SITE_SUBTITLE } from "../lib/constants";
import Hero from "../components/hero";

export default function Index({ allProvinces }) {
  return (
    <>
      <Layout>
        <Head>
          <title>
            {`${SITE_NAME}-${SITE_SUBTITLE}`}
          </title>
        </Head>
        <Container>
          <Intro />
          <h2 className="text-4xl md:text-5xl mb-6">省级行政区</h2>
          <Hero data={allProvinces} />
        </Container>
      </Layout>
    </>
  );
}

export async function getStaticProps() {
  const data = await getAllProvinces();
  const unsorted = await Promise.all(data.map(async ({ content, ...rest }) => {
    const hasData = !!content;
    return hasData
      ? {
        ...rest,
        hasData,
        // 这个是后面用来排序的
        href: content[0].href,
      }
      : { ...rest, hasData, href: "." };
  }));

  const hasDataProvinces = unsorted.filter((e) => e.hasData);
  const nonDataProvinces = unsorted.filter((e) => !e.hasData);

  const allProvinces = hasDataProvinces
    .sort((a, b) => a.href.localeCompare(b.href))
    .concat(nonDataProvinces);

  return {
    props: {
      allProvinces,
    },
  };
}
