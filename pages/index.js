import Container from "../components/container";
import Intro from "../components/intro";
import Layout from "../components/layout";
import { getAllProvinces } from "../lib/provinceApi";
import Head from "next/head";
import { CMS_NAME } from "../lib/constants";
import Link from "next/link";
import cn from "classnames";
import Hero from "../components/hero";

export default function Index({ allProvinces }) {
  return (
    <>
      <Layout>
        <Head>
          <title>Aparecium {CMS_NAME}</title>
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
  const data = getAllProvinces();

  const unsorted = data.map(({ content, ...rest }) => {
    const hasData = !!content;
    return hasData
      ? {
          ...rest,
          hasData,
          href: JSON.parse(content).href,
        }
      : { ...rest, hasData, href: "." };
  });

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
