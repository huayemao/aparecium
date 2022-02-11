const BASE_URL = "http://www.stats.gov.cn/tjsj/tjbz/tjyqhdmhcxhfdm/2021/";
const CODE = "43";
const PROVINCE_NAME = "湖南省"
const CITY_COUNT = 14

const originalNode = {
  href: CODE + ".html",
  value: PROVINCE_NAME,
};

const obj = {
  href: BASE_URL + CODE + ".html",
  value: PROVINCE_NAME,
  children: {},
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function chunk(array, size) {
  size = Math.max(size, 0);
  const length = array == null ? 0 : array.length;
  if (!length || size < 1) {
    return [];
  }
  let index = 0;
  let resIndex = 0;
  const result = new Array(Math.ceil(length / size));

  while (index < length) {
    result[resIndex++] = Array.prototype.slice.call(
      array,
      index,
      (index += size)
    );
  }
  return result;
}

const parseRow = (e, keys) => {
  const fields = [...e.cells].map((e) => e.textContent.trim());
  const entries = fields.map((e, i) => [keys[i], e]);
  const obj = Object.fromEntries(entries);
  return {
    key: fields[0],
    value: obj,
    href: e.querySelector("a")?.getAttribute("href"),
  };
};

async function parseTree(node, depth = 1, preHref = "", index) {
  const { href, ...rest } = node;
  if (!href) {
    return {
      ...rest,
      href,
      children: null,
    };
  }
  const pattern = preHref.includes("/") ? /\/\d+\.html/ : /\d+\.html/;
  const firstPath = preHref.replace(BASE_URL, "").replace(pattern, "");
  const url = firstPath + (firstPath.length ? "/" : "") + href;
  const fullHref = href.includes("http") ? href : BASE_URL + url;

  if (depth === 5) {
    return {
      ...rest,
      href: fullHref,
    };
  }

  return await fetchChildren();

  // 看来智能深度优先
  async function fetchChildren() {
    console.log(fullHref);
    const tableEl = await getTableData(fullHref);
    const keys = [...tableEl.rows[0].cells].map((e) => e.textContent);

    const records = [...tableEl.rows].slice(1).map((e) => parseRow(e, keys));
    let data;

    if (depth !== 1) {
      if (records.length > 4) {
        const slices = chunk(records, 4);
        const raw = [];

        for (let i = 0; i < slices.length; i++) {
          const slice = await Promise.all(
            slices[i].map((node) => parseTree(node, depth + 1, url))
          );
          raw.push(...slice);
        }

        data = raw;
      } else {
        data = await Promise.all(
          records.map((node) => parseTree(node, depth + 1, url))
        );
      }
    } else {
      data = await Promise.all(
        [records[index]].map((node) => parseTree(node, depth + 1, url))
      );
    }

    const children = Object.fromEntries(data.map((e) => [e.key, e]));
    return {
      ...rest,
      href: fullHref,
      children,
    };
  }
}

async function getTableData(url) {
  const html = await fetch(url).then((res) => res.text());
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const tableSelector =
    "body > table:nth-child(3) > tbody > tr:nth-child(1) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td > table";

  const table = doc.querySelector(tableSelector);
  if (!table) {
    alert("内容出错");
  }
  return table;
}

try {
  for (let i = 0; i < CITY_COUNT; i++) {
    const keysRaw = localStorage.getItem("childrenKeys");

    if (!keysRaw || !Object.keys(JSON.parse(keysRaw)).includes(`${i}`)) {
      await sleep(300);

      const root = await parseTree(originalNode, undefined, undefined, i);
      console.log(root);

      localStorage.setItem(
        Object.keys(root.children)[0],
        JSON.stringify(root.children, undefined, 0)
      );
      const keys = keysRaw ? JSON.parse(keysRaw) : {};
      const updatedKeys = Object.assign({}, keys, {
        [i]: Object.keys(root.children)[0],
      });
      localStorage.setItem("childrenKeys", JSON.stringify(updatedKeys));
    }
  }
  const keysRaw = localStorage.getItem("childrenKeys");
  const keys = keysRaw ? JSON.parse(keysRaw) : {};
  Object.values(keys).forEach((key) => {
    obj.children[key] = Object.values(JSON.parse(localStorage.getItem(key)))[0];
  });
  localStorage.clear()
} catch (error) {
  alert(error);
}
