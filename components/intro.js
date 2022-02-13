import { SITE_NAME } from "../lib/constants";

export default function Intro() {
  return (
    <section className="flex-col md:flex-row flex items-center md:justify-between mt-16 mb-16 md:mb-12">
      <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight md:pr-8">
        {SITE_NAME}.
      </h1>
      <h4 className="text-center md:text-left text-lg mt-5 md:pl-8">
        数据来源：{" "}
        <a
          href="http://www.stats.gov.cn/tjsj/tjbz/tjyqhdmhcxhfdm/2021/index.html"
          className="underline hover:text-success duration-200 transition-colors"
        >
          国家统计局-全国统计用区划代码和城乡划分代码
        </a>
      </h4>
    </section>
  );
}
