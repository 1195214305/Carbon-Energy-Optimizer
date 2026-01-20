import { useState } from 'react'
import { Zap, TrendingDown, Settings, BarChart3, Sparkles } from 'lucide-react'
import InputPanel from './components/InputPanel'
import ResultPanel from './components/ResultPanel'
import { OptimizationInput, OptimizationResult } from './types'

function App() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<OptimizationResult | null>(null)
  const [qwenApiKey, setQwenApiKey] = useState('')

  const handleOptimize = async (input: OptimizationInput) => {
    setLoading(true)
    try {
      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...input, qwenApiKey })
      })

      if (!response.ok) throw new Error('优化计算失败')

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('优化失败:', error)
      alert('优化计算失败，请检查输入参数')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark text-white">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
      </div>

      {/* 导航栏 */}
      <nav className="relative z-10 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">碳能优化器</h1>
                <p className="text-xs text-gray-400">综合能源系统优化平台</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <TrendingDown className="w-4 h-4 text-primary" />
                  <span>碳交易</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-secondary" />
                  <span>需求响应</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span>AI分析</span>
                </div>
              </div>

              <button
                onClick={() => {
                  const key = prompt('请输入千问API Key（可选）:')
                  if (key) setQwenApiKey(key)
                }}
                className="glass-hover p-2 rounded-lg"
                title="配置千问API"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容 */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InputPanel onOptimize={handleOptimize} loading={loading} />
          <ResultPanel result={result} loading={loading} />
        </div>
      </main>

      {/* 页脚 */}
      <footer className="relative z-10 mt-16 border-t border-white/10 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-400">
          <p>本项目由 <a href="https://www.aliyun.com/product/esa" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">阿里云ESA</a> 提供加速、计算和保护</p>
          <p className="mt-2">基于碳交易机制的综合能源系统优化 | 边缘计算驱动</p>
        </div>
      </footer>
    </div>
  )
}

export default App
