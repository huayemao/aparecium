import Link from "next/link";

type BreadCrumbItem = {
  key: string;
  name: string;
};
export function BreadCrumb({
  items, rootSlug,
}: {
  items: BreadCrumbItem[];
  rootSlug: string;
}) {
  return (
    <ol className="flex items-center space-x-1 md:space-x-3">
      {items.map((e, i) => {
        return (
          <li key={e.key}>
            <div className="flex items-center">
              {i > 0 && (
                <span className="text-sm font-medium text-gray-700">/</span>
              )}

              <Link
                className={"hover:underline ml-1 text-sm text-gray-700 hover:text-gray-900 md:ml-2 dark:text-gray-400 dark:hover:text-white" +
                  (i === 0 ? " font-bold" : "font-medium")}
                href={i === 0
                  ? `/provinces/${rootSlug}`
                  : `/provinces/${rootSlug}/${e.key}`}
              >
                {e.name}
              </Link>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
