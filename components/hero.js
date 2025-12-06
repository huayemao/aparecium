import Avatar from "../components/avatar";
import DateFormatter from "../components/date-formatter";
import CoverImage from "../components/cover-image";
import Link from "next/link";

const ProvincePreview = ({ province }) => {
  const { slug, title, englishName, abbreviation, href, hasData } = province;
  const [word, pinyin] = title.split(" ");
  return (
    <Link href={hasData ? `/provinces/${slug}` : ""} className="flex p-6 max-w-sm bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
      <div className="flex items-center justify-center flex-shrink-0 h-12 w-12 rounded-xl text-gray-600 bg-gray-200">
        {abbreviation.split(" ")[0]}
      </div>
      <div className="flex flex-col flex-grow ml-4 truncate">
        <div className="mb-2">
          <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            {word}
          </h5>
          <p
            title={englishName}
            className="text-gray-600 dark:text-gray-400 truncate"
          >
            {englishName}
          </p>
        </div>
        <p className="text-gray-600 dark:text-gray-400 truncate">
          {/* {hasData && (
            <span title={href} className="text-sm">
              数据来源：
              {href}
            </span>
          )} */}
          {!hasData && (
            <span className="bg-gray-100 text-gray-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300">
              暂无数据
            </span>
          )}
        </p>
      </div>
    </Link>
  );
};

export default function Hero({ data }) {
  return (
    <section>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-10">
        {data.map((province) => (
          <ProvincePreview
            key={province.slug}
            province={province}
          ></ProvincePreview>
        ))}
      </div>
    </section>
  );
}
