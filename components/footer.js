import Container from './container'

export default function Footer() {
  return (
    <footer className="bg-accent-1 border-t border-accent-2">
      <Container>
        <div className="py-16 flex flex-col gap-12">
          {/* 更多地图应用部分 */}
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <h3 className="text-3xl lg:text-4xl font-bold tracking-tighter leading-tight text-center lg:text-left lg:w-1/2">
              更多地图应用
            </h3>
            
            <div className="flex flex-col items-center gap-4 lg:w-1/2">
              {/* 图片和链接放在一起 */}
              <a 
                href="https://uni.utities.online/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 w-full max-w-sm"
              >
                <img
                  src="https://huayemao.run/api/files/china-top-univirsities-in-map.webp"
                  alt="中国重点高校分布地图"
                  className="w-full h-auto rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                />
                <span className="text-lg font-medium text-success hover:text-blue-700 transition-colors">
                  中国重点高校分布地图
                </span>
              </a>
            </div>
          </div>
          
          {/* 版权信息部分 */}
          <div className="pt-8 border-t border-accent-2 text-center text-sm text-gray-600">
            <p>© {new Date().getFullYear()} 地理数据可视化平台</p>
            <p className="mt-2">使用 Next.js 和 React 构建</p>
          </div>
        </div>
      </Container>
    </footer>
  )
}
