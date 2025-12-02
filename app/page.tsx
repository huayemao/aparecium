import Container from "../components/container";
import Intro from "../components/intro";
import { getAllProvinces } from "../lib/getProvinces";
import { CMS_NAME, SITE_NAME, SITE_SUBTITLE } from "../lib/constants";
import Hero from "../components/hero";
import ChinaMap from "../components/ChinaMap";
import { Suspense } from "react";

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

  return (
    <Container>
      <Intro />
      <h2 className="text-4xl md:text-5xl mb-6">地图可视化</h2>
      <main className="w-full space-y-12">
        <Suspense fallback={<div>加载中...</div>}>
          <ChinaMap provinces={allProvinces} />
        </Suspense>
        <Hero data={allProvinces} />
      </main>
    </Container>
  );
}
