// todo:还可以可视化为树形图
// todo:根据库中每个节点的 ParentId，根据这个信息是否可以构造出一颗树?
// 其实数据库里面还可以记录 level 信息，虽然好像可以从 id 中得出
// 从顶层开始,每次找出 parentId 为 它的结点, 并按 id 升序 push 进去？
// 遍历获取数据时如果构建出的树中已经有该结点的 children 数据就跳过不请求。
// 所以最好还是全部改成层序遍历吧，这样只需知道当前在哪一层，中断后从这一层开始？但是深的层次会有很多数据，会很大浪费
// 中断时保存结点的 href 好了。说明该结点 没有 children，其他应该都是有 children的
// 这样根据 href 在库中找结点 id。从这层的这个结点开始获取数据？还是上一层？妈的，还是深度优先好了。每次从一个 city 开始
// 反向 return 的缺点是 很晚才能得到一棵树，中断后数据没有得到保存，就白废掉了
// 构建出一颗树出来后，children 为空，说明数据没有获取成功。
export class Tree<T extends { parentId: string | null; id: string }> {
  value: T;
  children: Tree<T>[] | null = null;
  constructor(value: T, children: Tree<T>[] | null) {
    this.value = value;
    this.children = children;
  }

  static from<T extends { parentId: string | null; id: string }>(
    items: T[],
    rootId: string | null = null
  ) {
    function buildChildren<T extends { parentId: string | null; id: string }>(
      items: T[],
      parentId: string | null = null
    ) {
      const filtered = items.filter((item) => item.parentId === parentId);
      // 如果没有 parentId 为 rootId 的 item ，那 root 就是个叶子
      if (!filtered.length) {
        return null;
      }

      const nodes: Tree<T>[] = filtered.map((item) => {
        const children = buildChildren(items, item.id);

        return new Tree(item, children);
      });

      return nodes;
    }

    const root = items.find((e) => e.id === rootId);
    if (!root) {
      throw Error("根节点未找到");
    }
    return new Tree<T>(root, buildChildren(items, rootId));
  }

  isLeaf() {
    return this.children === null;
  }

  get hasChildren() {
    return !this.isLeaf();
  }

  async dfs(
    cb: (el: Tree<T>, level: number) => Promise<boolean>,
    level = 0
  ): Promise<Boolean> {
    const next = await cb(this, level);
    if (!next) {
      return false;
    }
    if (!this.children) return true;
    for (const child of this.children) {
      const next = await child.dfs(cb, level + 1);
      if (!next) {
        return next;
      }
    }
    return true;
  }

  async get(id: T["id"]): Promise<{
    path: T[];
    data:
      | (T & {
          hasChildren: boolean;
        })[]
      | null;
  }> {
    let path: T[] = [];
    let element: Tree<T>;

    await this.dfs(async (root, level) => {
      path[level] = root.value;
      // path.push(root.value);
      if (id === root.value.id) {
        path = path.slice(0, level + 1);
        element = root;
        return false;
      }
      return true;
    });

    return {
      path,
      data:
        // @ts-ignore
        element?.children?.map((e) => ({
          ...e.value,
          hasChildren: e.hasChildren,
        })) || null,
    };
  }
}
