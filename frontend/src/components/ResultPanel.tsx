import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingDown, Zap, Flame, DollarSign, Sparkles } from 'lucide-react'
import { OptimizationResult } from '../types'

interface ResultPanelProps {
  result: OptimizationResult | null
  loading: boolean
}

export default function ResultPanel({ result, loading }: ResultPanelProps) {
  if (loading) {
    return (
      <div className="glass rounded-2xl p-6 flex items-center justify-center min-h-[600px]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400">正在进行优化计算...</p>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="glass rounded-2xl p-6 flex items-center justify-center min-h-[600px]">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Zap className="w-10 h-10 text-primary" />
          </div>
          <p className="text-gray-400">配置参数后点击"开始优化"查看结果</p>
        </div>
      </div>
    )
  }

  const chartData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    电负荷: result.optimizedElectricLoad[i],
    热负荷: result.optimizedHeatLoad[i],
    燃气轮机: result.gtPower[i],
    电储能: result.esState[i],
    热储能: result.hsState[i]
  }))

  return (
    <div className="space-y-6">
      {/* 关键指标卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <DollarSign className="w-5 h-5 text-primary" />
            <span className="text-sm text-gray-400">总成本</span>
          </div>
          <p className="text-2xl font-bold">{result.totalCost.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">元</p>
        </div>

        <div className="glass rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingDown className="w-5 h-5 text-secondary" />
            <span className="text-sm text-gray-400">碳排放</span>
          </div>
          <p className="text-2xl font-bold">{result.carbonEmission.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">吨</p>
        </div>

        <div className="glass rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="w-5 h-5 text-accent" />
            <span className="text-sm text-gray-400">运维成本</span>
          </div>
          <p className="text-2xl font-bold">{result.operationCost.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">元</p>
        </div>

        <div className="glass rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-gray-400">能源成本</span>
          </div>
          <p className="text-2xl font-bold">{result.energyCost.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">元</p>
        </div>
      </div>

      {/* 负荷曲线图 */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4">24小时负荷曲线</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="hour" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #ffffff20', borderRadius: '8px' }}
            />
            <Legend />
            <Line type="monotone" dataKey="电负荷" stroke="#2dd4bf" strokeWidth={2} />
            <Line type="monotone" dataKey="热负荷" stroke="#f59e0b" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 设备出力图 */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4">设备出力分布</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="hour" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #ffffff20', borderRadius: '8px' }}
            />
            <Legend />
            <Bar dataKey="燃气轮机" fill="#8b5cf6" />
            <Bar dataKey="电储能" fill="#2dd4bf" />
            <Bar dataKey="热储能" fill="#f59e0b" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* AI分析建议 */}
      {result.aiAnalysis && (
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Sparkles className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-semibold">AI智能分析</h3>
          </div>
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 whitespace-pre-wrap">{result.aiAnalysis}</p>
          </div>
        </div>
      )}
    </div>
  )
}
