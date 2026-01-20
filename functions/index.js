/**
 * ESA Pages 边缘函数统一入口
 * 根据请求路径分发到对应的处理函数
 */

import optimizeHandler from './api/optimize.js'

async function fetch(request) {
  const url = new URL(request.url)
  const path = url.pathname

  // API 路由分发
  if (path === '/api/optimize') {
    return optimizeHandler(request)
  }

  // 健康检查
  if (path === '/api/health') {
    return new Response(JSON.stringify({ status: 'ok', service: 'Carbon Energy Optimizer' }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }

  // 非 API 请求，返回 404 让 ESA 处理静态资源
  return new Response(null, { status: 404 })
}

export default { fetch }
