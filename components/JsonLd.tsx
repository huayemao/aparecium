"use client";

import { useEffect } from "react";

interface JsonLdProps {
  data: Record<string, any>;
}

/**
 * JSON-LD 组件，用于向页面添加结构化数据
 * 这是一个客户端组件，因为它需要操作DOM来添加script标签
 */
export default function JsonLd({ data }: JsonLdProps) {
  useEffect(() => {
    // 创建script元素
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(data);
    
    // 将script添加到head中
    document.head.appendChild(script);
    
    // 清理函数
    return () => {
      document.head.removeChild(script);
    };
  }, [data]);

  // 此组件不渲染任何可见元素
  return null;
}
