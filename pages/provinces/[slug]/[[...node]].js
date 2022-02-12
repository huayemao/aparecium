// https://nextjs.org/docs/routing/dynamic-routes
import { useRouter } from "next/router";
import ErrorPage from "next/error";
import { map, get, isEmpty, drop, dropWhile } from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import Container from "../../../components/container";
import Layout from "../../../components/layout";
import { getProvinceBySlug } from "../../../lib/provinceApi";
import Head from "next/head";
import MappedTable from "../../../components/mapped-table";
import Link from "next/link";
import Header from "../../../components/header";
import { getAllProvinces } from "../../../lib/provinceApi";

const LinkOrText = ({ propertyName, value, item }) => {
  const router = useRouter();
  return propertyName === "名称" && item.hasChildren ? (
    <Link href={`/provinces/${router.query.slug}/${item.统计用区划代码}`}>
      <a className="font-medium text-blue-600 hover:underline">{value}</a>
    </Link>
  ) : (
    value
  );
};

export default function Province({ provinceName, data, path }) {
  const router = useRouter();

  const namePath = useMemo(() =>
    [provinceName].concat(map(path, "value.名称"))
  );

  return (
    <Layout>
      <Container>
        <Header />
        <nav className="flex my-4" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            {namePath.map((e, i) => {
              return (
                <li key={e}>
                  <div className="flex items-center">
                    {i > 0 && (
                      <span className="text-sm font-medium text-gray-700">
                        /
                      </span>
                    )}
                    <Link
                      href={
                        i === 0
                          ? `/provinces/${router.query.slug}`
                          : `/provinces/${router.query.slug}/${path[i - 1].key}`
                      }
                    >
                      <a
                        className={
                          "hover:underline ml-1 text-sm text-gray-700 hover:text-gray-900 md:ml-2 dark:text-gray-400 dark:hover:text-white" +
                          (i === 0 ? " font-bold" : "font-medium")
                        }
                      >
                        {e}
                      </a>
                    </Link>
                  </div>
                </li>
              );
            })}
          </ol>
        </nav>
        <div className="text-gray-900 bg-white rounded-lg border border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          <MappedTable
            customCell={LinkOrText}
            data={data}
            propertyNames={Object.keys(data[0]).filter(
              (e) => e !== "hasChildren"
            )}
          />
        </div>
      </Container>
    </Layout>
  );
}

export async function getStaticProps(context) {
  const { params } = context;
  const { slug, node: arr } = params;
  const [node] = arr || [];
  const content = getProvinceBySlug(slug);
  const data = JSON.parse(content);
  const path = node ? findPath2Node(data, node) : [];
  const objGetter = (() => {
    if (path[0]) {
      const getter = path.map(({ key = "" }) => key + ".children").join(".");
      return "children." + getter;
    } else {
      return "children";
    }
  })();

  const getData = (e) => ({
    ...e.value,
    hasChildren: !isEmpty(e.children),
  });

  const dataSlice = map(get(data, objGetter), getData);

  return {
    props: {
      provinceName: data.value,
      data: dataSlice,
      path,
    },
  };
}

export async function getStaticPaths() {
  const data = getAllProvinces();
  const hasDataProvinces = data.filter(({ content }) => !!content);
  const paths = hasDataProvinces.flatMap(({ content, slug }) => {
    const { children } = JSON.parse(content);
    return map(children, (e) => {
      return {
        params: {
          slug,
          node: [e.value.统计用区划代码],
        },
      };
    });
  });

  return {
    paths,
    fallback: "blocking",
  };
}

function findPath2Node(data, key, path = []) {
  const keys = Object.keys(data.children);
  const pivot = keys.findIndex((e) => e > key);
  const index = pivot === -1 ? keys.length - 1 : pivot - 1;
  const targetKey = map(data.children, "key")[index];
  const record = { key: targetKey, value: data.children[targetKey].value };
  if (keys[index] === key) {
    return [...path, record];
  }
  return findPath2Node(data.children[targetKey], key, [...path, record]);
}
