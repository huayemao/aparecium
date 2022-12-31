import { mapKeys } from "lodash";
import prisma, { Area } from "../lib/prisma";
import { JSDOM } from "jsdom";
import { entries } from "../lib/entry";
import { Tree } from "../lib/model/Tree";
import { buildProvinceTreeByAreaId } from "../lib/getProvinces";

const _importDynamic = new Function("modulePath", "return import(modulePath)");

// https://stackoverflow.com/questions/69041454/error-require-of-es-modules-is-not-supported-when-importing-node-fetch
const fetch = async function (...args: any) {
  const { default: fetch } = await _importDynamic("node-fetch");
  return fetch(...args);
};

const BASE_URL = "http://www.stats.gov.cn/tjsj/tjbz/tjyqhdmhcxhfdm/2021/";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseTable(tableEl: HTMLTableElement) {
  const parseRow = (e: HTMLTableRowElement, keys: string[]) => {
    // 根据 keys 解析 json
    const fields = Array.from(e.cells).map((e) => e.textContent?.trim());
    const entries = fields.map((e, i) => [keys[i], e]);
    const obj = Object.fromEntries(entries);
    return {
      value: obj /* 整个为 value */,
      href:
        e.querySelector("a")?.getAttribute("href") ||
        null /* a 标签的 href，指向详情页，【市辖区】这样的结点也没有孩子 */,
    };
  };

  const ths = (tableEl as HTMLTableElement).rows[0].cells;
  const keys = Array.from(ths).map((e) => e.textContent) as string[];
  const contentRows = Array.from((tableEl as HTMLTableElement).rows);
  const records = contentRows.slice(1).map((e) => parseRow(e, keys));
  return records;
}

function resolveHref(preHref: string | null, href: any) {
  // todo: 改一下这个的实现
  const pattern = preHref?.includes("/") ? /\/\d+\.html/ : /\d+\.html/;
  const pathnameFirstPart =
    preHref?.replace(BASE_URL, "").replace(pattern, "") || "";
  const pathname = href
    ? pathnameFirstPart + (pathnameFirstPart.length ? "/" : "") + href
    : null;
  const fullHref = href?.includes("http") ? href : BASE_URL + pathname;
  return { fullHref, pathname };
}

async function getTableData(url: string) {
  const html = await fetch(url).then((res) => res.text());
  const doc = new JSDOM(html).window.document;

  const tableSelector =
    "body > table:nth-child(3) > tbody > tr:nth-child(1) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td > table";

  const table: HTMLTableElement | null = doc.querySelector(tableSelector);
  if (!table) {
    console.error({ url }, { html });
    // 可能会是 Please enable JavaScript and refresh the pag
    throw Error("内容出错，没有 table 元素");
  }
  return table;
}

async function fetchProvinceData(root: Area) {
  const count = await prisma.area.count({
    where: {
      id: {
        startsWith: (root.href as string).replace(".html", ""),
      },
    },
  });
  if (!count) {
    try {
      const data = root;
      await prisma.area.create({
        data,
      });
    } catch (error) {
      console.error(error);
      return;
    }
  }

  let tree: Tree<Area> | undefined;

  while ((tree = await shouldContinue())) {
    await tree.dfs(async (el, level) => {
      // 省 0
      // 市 1
      // 县 2
      // 乡 3
      // 村 4
      if (level < 4 && el.isLeaf() && !!el.value.href) {
        const url = BASE_URL + "/" + (el.value.href || "");
        console.log("level: " + level, url);

        await sleep(500);

        const tableEl = await getTableData(url);

        const records = parseTable(tableEl)
          .map((e) => adapt(e))
          .map((area) => ({
            ...area,
            href: resolveHref(el.value?.href || "", area.href).pathname,
            parentId: el.value.id,
            categoryCode: area.categoryCode
              ? parseInt(String(area.categoryCode).trim())
              : null,
          }));

        console.table(records);

        for (let i = 0; i < records.length; i++) {
          await prisma.area.create({
            data: records[i],
          });
        }
      }

      return true;
    });
  }

  async function shouldContinue() {
    const id = root.id;

    const tree = await buildProvinceTreeByAreaId(id);

    let shouldContinue = false;

    await tree.dfs(async (el, level) => {
      if (level < 4 && el.isLeaf() && !!el.value.href) {
        shouldContinue = true;
        return false;
      }
      return true;
    });

    if (shouldContinue) {
      console.log("building tree...");
      return tree;
    }
  }
}

async function run() {
  for (const province of entries.slice(18, 30)) {
    try {
      const [name, href] = province;
      const CODE = href?.replace(BASE_URL, "");

      const root: Area = {
        href: CODE,
        id: CODE.replace(/\.html/, "0000000000"),
        name: name,
        categoryCode: null,
        parentId: null,
      };

      await fetchProvinceData(root);
    } catch (error) {
      console.log(error);
      return;
    }
  }
}

function adapt(root): Area {
  const mapping = {
    统计用区划代码: "id",
    名称: "name",
    城乡分类代码: "categoryCode",
  };

  const obj = mapKeys(root.value, (v, k) => mapping[k]);
  const data = {
    ...obj,
    href: root.href,
  };
  return data;
}

run().then(
  () => process.exit(0),
  (e) => {
    console.error(e);
    process.exit(1);
  }
);
