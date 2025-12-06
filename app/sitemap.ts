import type { MetadataRoute } from 'next'
import { getAllProvinces } from '../lib/getProvinces'
import { getAllPosts } from '../lib/api'
import { SITE_NAME, SITE_URL } from '../lib/constants'
import prisma from '../lib/prisma'
import { getIsoCodeByNumericPrefix } from '../lib/utils/getIsoCodeByNumericPrefix'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 使用 DOMAIN 作为基础域名
  const baseUrl = SITE_URL

  // 获取所有省份数据
  const provinces = await getAllProvinces()
  const provinceEntries: MetadataRoute.Sitemap = provinces.map((province) => ({
    url: `${baseUrl}/provinces/${province.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  // 获取所有文章数据
  const posts = getAllPosts(['slug', 'date'])
  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/posts/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'weekly',
    priority: 0.5,
  }))

  // 静态页面
  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
  ]

  // 获取嵌套节点页面的静态路径
  const areas = await prisma.area.findMany({
    where: { id: { endsWith: '00000000' } },
    select: { id: true }
  });

  // 生成嵌套节点页面的sitemap条目
  const nestedEntries: MetadataRoute.Sitemap = areas
    .map((area, index) => {
      const provincePrefix = area.id.slice(0, 2);
      const isoCode = getIsoCodeByNumericPrefix(provincePrefix);
      return isoCode 
        ? {
            url: `${baseUrl}/provinces/${isoCode}/${area.id}`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
          }
        : null;
    })
    .filter(Boolean) as MetadataRoute.Sitemap;

  // 合并所有条目
  return [
    ...staticEntries,
    ...provinceEntries,
    ...nestedEntries,
    // ...postEntries
  ]
}