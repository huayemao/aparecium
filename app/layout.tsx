import Alert from '../components/alert'
import Footer from '../components/footer'
import Meta from '../components/meta'
import Header from '../components/Header'
import SearchModal from '../components/SearchModal'
import { SearchModalProvider } from '../lib/hooks/useSearchModal'
import '../styles/index.css'
import { Analytics } from '@vercel/analytics/next'



export const metadata = {
  title: 'Aparecium - 中国行政区划数据平台',
  description: 'Administrative divisions of China; 中国行政区划数据平台，提供详细的省市县乡镇行政区划信息查询和可视化',
  keywords: ['中国行政区划', '行政区划数据', '省市县乡镇数据', '行政区划地图', 'China administrative divisions'],
  authors: {
    name: 'Bobcat(huayemao)',
    url: 'https://huayemao.run/about',
  },
  generator: 'Next.js',
  openGraph: {
    type: 'website',
    title: 'Aparecium - 中国行政区划数据平台',
    description: 'Administrative divisions of China; 中国行政区划数据平台，提供详细的省市县乡镇行政区划信息查询和可视化',
    url: 'https://aparecium.example.com',
    images: [
      {
        url: 'https://og-image.vercel.app/中国行政区划数据平台.png?theme=light&md=1&fontSize=100px',
        width: 1200,
        height: 630,
        alt: 'Aparecium - 中国行政区划数据平台',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aparecium - 中国行政区划数据平台',
    description: 'Administrative divisions of China; 中国行政区划数据平台',
    images: ['https://og-image.vercel.app/中国行政区划数据平台.png?theme=light&md=1&fontSize=100px'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        <Meta />
      </head>
      <body className="min-h-screen flex flex-col">
        <SearchModalProvider>
          <Alert preview={false} />
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
          <SearchModal />
        </SearchModalProvider>
        <Analytics />
      </body>
    </html>
  )
}
