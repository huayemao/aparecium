import Container from "../components/container";
import Intro from "../components/intro";
import { getAllProvinces } from "../lib/getProvinces";
import { CMS_NAME, SITE_NAME, SITE_SUBTITLE } from "../lib/constants";
import Hero from "../components/hero";
import ChinaMap from "../components/ChinaMap";
import { Suspense } from "react";
import JsonLd from "../components/JsonLd";

// 添加首页的metadata
export const metadata = {
  title: `首页 - ${SITE_NAME} - ${SITE_SUBTITLE}`,
  description: '中国行政区划数据平台首页，提供全国34个省级行政区的行政区划数据查询、地图可视化展示和层级结构浏览',
  keywords: ['中国地图', '行政区划查询', '省份数据', '省市县', '行政区划层级', 'China provinces'],
  openGraph: {
    title: `首页 - ${SITE_NAME} - ${SITE_SUBTITLE}`,
    description: '中国行政区划数据平台首页，提供全国34个省级行政区的行政区划数据查询、地图可视化展示和层级结构浏览',
    images: [
      {
        url: 'https://og-image.vercel.app/中国行政区划地图.png?theme=light&md=1&fontSize=100px',
        width: 1200,
        height: 630,
        alt: '中国行政区划地图展示',
      },
    ],
  },
}

// 定义页面所需的数据类型
interface Province {
  code: string;
  name: string;
  hasData: boolean;
  href?: string;
  slug: string;
}

// 服务器组件，直接获取数据
async function fetchProvinces() {
  const data = await getAllProvinces();
  const unsorted = await Promise.all(data.map(async ({ content, slug, ...rest }) => {
    const hasData = !!content;
    // 确保返回的数据符合Province接口
    const province: Province = {
      ...rest,
      code: slug || '',
      name: slug || '', // 使用slug作为name，因为rest对象中没有name属性
      hasData,
      slug,
      href: hasData ? content?.[0]?.href || '' : '.'
    };
    return province;
  }));

  const hasDataProvinces = unsorted.filter((e: Province) => e.hasData);
  const nonDataProvinces = unsorted.filter((e: Province) => !e.hasData);

  const allProvinces = hasDataProvinces
    .sort((a: Province, b: Province) => a.href?.localeCompare(b.href || '') || 0)
    .concat(nonDataProvinces);

  return allProvinces;
}

// 主页面组件
export default async function HomePage() {
  // 直接在组件中获取数据（这在Server Components中是允许的）
  const allProvinces = await fetchProvinces();
  // Website类型的JSON-LD结构化数据
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "Website",
    "name": SITE_NAME,
    "description": SITE_SUBTITLE,
    "url": "https://example.com/", // 替换为实际网站URL
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://example.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <Container>
      {/* 添加JSON-LD结构化数据 */}
      <JsonLd data={websiteJsonLd} />
      
      <header className="mb-8">
        <Intro />
      </header>
      
      <section>
        <h1 className="text-4xl md:text-5xl mb-6 font-bold">地图可视化</h1>
        <div className="w-full space-y-12">
          <Suspense fallback={<div className="text-center p-8">加载中...</div>}>
            <ChinaMap provinces={allProvinces} />
          </Suspense>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">省份列表</h2>
            <Hero data={allProvinces} />
          </section>
        </div>
      </section>
    </Container>
  )
}
