import { useState, useEffect, useRef } from 'react';
import chinaProvincesData from '../data/china-provinces.json';
import { useRouter } from 'next/navigation';

// 墨卡托投影转换函数
const mercatorProjection = (lon, lat) => {
  // 转换为弧度
  const lonRad = lon * Math.PI / 180;
  const latRad = lat * Math.PI / 180;

  // 墨卡托投影公式
  // x = 经度
  // y = ln(tan(π/4 + 纬度/2))
  const x = lonRad;
  const y = Math.log(Math.tan(Math.PI / 4 + latRad / 2));

  return { x, y };
};

export default function ChinaMap({ provinces }) {
  const [hoveredProvince, setHoveredProvince] = useState(null);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const svgRef = useRef(null);
  const router = useRouter();

  // 创建省份ID到slug的映射
  const provinceMap = {};
  provinces.forEach(p => {
    provinceMap[p.slug] = p;
  });

  // 创建adcode到slug的映射关系
  const adcodeToSlug = {
    110000: 'CN-BJ', // 北京
    120000: 'CN-TJ', // 天津
    130000: 'CN-HE', // 河北
    140000: 'CN-SX', // 山西
    150000: 'CN-NM', // 内蒙古
    210000: 'CN-LN', // 辽宁
    220000: 'CN-JL', // 吉林
    230000: 'CN-HL', // 黑龙江
    310000: 'CN-SH', // 上海
    320000: 'CN-JS', // 江苏
    330000: 'CN-ZJ', // 浙江
    340000: 'CN-AH', // 安徽
    350000: 'CN-FJ', // 福建
    360000: 'CN-JX', // 江西
    370000: 'CN-SD', // 山东
    410000: 'CN-HA', // 河南
    420000: 'CN-HB', // 湖北
    430000: 'CN-HN', // 湖南
    440000: 'CN-GD', // 广东
    450000: 'CN-GX', // 广西
    460000: 'CN-HI', // 海南
    500000: 'CN-CQ', // 重庆
    510000: 'CN-SC', // 四川
    520000: 'CN-GZ', // 贵州
    530000: 'CN-YN', // 云南
    540000: 'CN-XZ', // 西藏
    610000: 'CN-SN', // 陕西
    620000: 'CN-GS', // 甘肃
    630000: 'CN-QH', // 青海
    640000: 'CN-NX', // 宁夏
    650000: 'CN-XJ'  // 新疆
  };

  // 地图配置常量，统一管理所有地图投影参数
  const mapConfig = {
    scale: 300, // 墨卡托投影缩放因子
    offsetX: 250, // 水平居中偏移
    offsetY: 150, // 垂直居中偏移（根据viewBox高度的一半调整）
    centerLon: 103, // 中国地图大致中心点经度
    centerLat: 36, // 中国地图大致中心点纬度
    // 计算中心投影坐标
    getCenterProjection() {
      return mercatorProjection(this.centerLon, this.centerLat);
    }
  };

  // 处理省份点击事件
  const handleProvinceClick = (feature) => {
    const adcode = feature.properties.adcode;
    const slug = adcodeToSlug[adcode];

    if (slug && provinceMap[slug]) {
      window.location.href = `/provinces/${slug}`;
    } else {
      alert(`该省份 ${feature.properties.name} 暂无数据`);
    }
  };

  // 计算多边形中心点的辅助函数
  const getPolygonCenter = (coordinates) => {
    let sumX = 0, sumY = 0, count = 0;

    coordinates.forEach(ring => {
      ring.forEach(([lon, lat]) => {
        sumX += lon;
        sumY += lat;
        count++;
      });
    });

    return count > 0 ? { lon: sumX / count, lat: sumY / count } : { lon: 0, lat: 0 };
  };

  // 平面坐标转换函数 - 使用墨卡托投影
  const transformGeometry = (geometry) => {
    // 获取地图中心点的墨卡托投影坐标
    const center = mapConfig.getCenterProjection();

    if (geometry.type === 'Polygon') {
      return geometry.coordinates.map(coords => {
        return coords.map(([lon, lat]) => {
          // 使用墨卡托投影转换坐标
          const projected = mercatorProjection(lon, lat);
          // 相对于中心点进行缩放和偏移
          const x = (projected.x - center.x) * mapConfig.scale + mapConfig.offsetX;
          const y = (center.y - projected.y) * mapConfig.scale + mapConfig.offsetY; // y轴翻转以符合SVG坐标系
          return `${x},${y}`;
        }).join(' ');
      });
    } else if (geometry.type === 'MultiPolygon') {
      return geometry.coordinates.flatMap(polygons => {
        return polygons.map(coords => {
          return coords.map(([lon, lat]) => {
            const projected = mercatorProjection(lon, lat);
            const x = (projected.x - center.x) * mapConfig.scale + mapConfig.offsetX;
            const y = (center.y - projected.y) * mapConfig.scale + mapConfig.offsetY;
            return `${x},${y}`;
          }).join(' ');
        });
      });
    }
    return [];
  };

  // 获取省份中心点用于标注名称
  const getProvinceCenterForLabel = (geometry) => {
    // 获取地图中心点的墨卡托投影坐标
    const center = mapConfig.getCenterProjection();

    let provinceCenter;
    if (geometry.type === 'Polygon') {
      provinceCenter = getPolygonCenter(geometry.coordinates);
    } else if (geometry.type === 'MultiPolygon') {
      // 对于多边形，取第一个环的中心点
      provinceCenter = getPolygonCenter([geometry.coordinates[0][0]]);
    }

    // 使用墨卡托投影转换省份中心点坐标
    const projectedCenter = mercatorProjection(provinceCenter.lon, provinceCenter.lat);

    // 转换为SVG坐标
    return {
      x: (projectedCenter.x - center.x) * mapConfig.scale + mapConfig.offsetX,
      y: (center.y - projectedCenter.y) * mapConfig.scale + mapConfig.offsetY // y轴翻转以符合SVG坐标系
    };
  };

  return (
    <div className="relative w-full">
      {/* SVG地图容器 */}
      <div className="w-full rounded-lg shadow-md bg-gray-100 overflow-hidden">
        <svg
          ref={svgRef}
          className="w-full"
          viewBox="0 0 500 300" // 增大viewBox尺寸以适应放大后的地图
          preserveAspectRatio="xMidYMid meet"
        >
          {/* 第一层：所有省份的路径 */}
          <g id="province-paths">
            {chinaProvincesData.features.map((feature) => {
              const adcode = feature.properties.adcode;
              const slug = adcodeToSlug[adcode];
              const hasData = slug && provinceMap[slug];
              const isHovered = hoveredProvince === adcode;

              // 获取多边形路径
              const paths = transformGeometry(feature.geometry);

              return (
                <g key={`path-${adcode}`}>
                  {paths.map((path, index) => (
                    <path
                      key={`${adcode}-${index}`}
                      d={`M ${path} Z`}
                      fill={isHovered ? '#3bb2d0' : hasData ? '#888888' : '#cccccc'}
                      fillOpacity={isHovered ? 0.8 : 0.6}
                      stroke="#ffffff"
                      strokeWidth="1"
                      onMouseEnter={() => {
                        router.push(`/provinces/${slug}`);
                        setHoveredProvince(adcode)
                      }
                      }
                      onMouseLeave={() => setHoveredProvince(null)}
                      onClick={() => handleProvinceClick(feature)}
                      style={{
                        cursor: hasData ? 'pointer' : 'default',
                        transition: 'fill 0.2s ease'
                      }}
                    />
                  ))}
                </g>
              );
            })}
          </g>

          {/* 第二层：所有省份的文本标签 */}
          <g id="province-labels">
            {chinaProvincesData.features.map((feature) => {
              const adcode = feature.properties.adcode;
              const isHovered = hoveredProvince === adcode;
              const provinceName = feature.properties.name;

              // 获取省份中心点用于显示名称
              const center = getProvinceCenterForLabel(feature.geometry);

              return (
                <text
                  onMouseEnter={() => setHoveredProvince(adcode)}
                  onMouseLeave={() => setHoveredProvince(null)}
                  onClick={() => handleProvinceClick(feature)}
                  key={`label-${adcode}`}
                  x={center.x}
                  y={center.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="6"
                  fill={isHovered ? '#ffffff' : '#333333'}
                  fontWeight="500"
                  pointerEvents="none"
                  style={{
                    userSelect: 'none',
                    transition: 'fill 0.2s ease',
                    textShadow: isHovered ? '0 1px 2px rgba(0,0,0,0.3)' : 'none',
                    wordSpacing: '0.5em',
                    zIndex: 10
                  }}
                >
                  {provinceName}
                </text>
              );
            })}
          </g>
        </svg>
      </div>

      {/* 显示当前悬停的省份信息 */}
      {hoveredProvince && (
        <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg z-10 text-sm max-w-xs">
          {(() => {
            const feature = chinaProvincesData.features.find(
              f => f.properties.adcode === hoveredProvince
            );
            if (feature) {
              const adcode = feature.properties.adcode;
              const slug = adcodeToSlug[adcode];
              const hasData = slug && provinceMap[slug];

              return (
                <div>
                  <h3 className="font-medium text-lg">{feature.properties.name}</h3>
                  <p className="text-gray-600">{hasData ? '点击查看详情' : '暂无数据'}</p>
                </div>
              );
            }
            return null;
          })()}
        </div>
      )}

      {/* 提示信息 */}
      <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg z-10 text-sm">
        <p className="font-medium">点击省份查看详情</p>
        <p className="text-gray-600">悬停查看省份名称</p>
      </div>
    </div>
  );
}