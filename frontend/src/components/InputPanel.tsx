import { useState } from 'react'
import { Play, Upload } from 'lucide-react'
import { OptimizationInput } from '../types'

interface InputPanelProps {
  onOptimize: (input: OptimizationInput) => void
  loading: boolean
}

export default function InputPanel({ onOptimize, loading }: InputPanelProps) {
  const [input, setInput] = useState<OptimizationInput>({
    electricLoad: Array(24).fill(1000),
    heatLoad: Array(24).fill(800),
    pvPower: Array(24).fill(0).map((_, i) => i >= 6 && i <= 18 ? 500 : 0),
    wtPower: Array(24).fill(300),
    electricPriceBefore: Array(24).fill(1.0),
    electricPriceAfter: Array(24).fill(0.8),
    heatPriceBefore: Array(24).fill(0.5),
    heatPriceAfter: Array(24).fill(0.4),
    gridBuyPrice: Array(24).fill(1.2),
    gridSellPrice: Array(24).fill(0.6),
    gtEfficiency: 0.3,
    gbEfficiency: 0.9,
    hpCOP: 4.4,
    esCapacity: 400,
    hsCapacity: 400,
    carbonPrice: 0.5,
    drEnabled: true
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onOptimize(input)
  }

  const loadExample = () => {
    setInput({
      ...input,
      electricLoad: [800, 750, 700, 680, 700, 850, 1200, 1500, 1600, 1550, 1500, 1450, 1400, 1380, 1420, 1500, 1650, 1800, 1750, 1600, 1400, 1200, 1000, 900],
      heatLoad: [600, 580, 560, 550, 560, 650, 900, 1100, 1200, 1150, 1100, 1050, 1000, 980, 1020, 1100, 1250, 1400, 1350, 1200, 1000, 850, 700, 650]
    })
  }

  return (
    <div className="glass rounded-2xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">优化参数配置</h2>
        <button
          onClick={loadExample}
          className="flex items-center space-x-2 px-4 py-2 bg-primary/20 hover:bg-primary/30 rounded-lg transition-colors"
        >
          <Upload className="w-4 h-4" />
          <span>加载示例</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 设备参数 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">设备参数</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">燃气轮机效率</label>
              <input
                type="number"
                step="0.01"
                value={input.gtEfficiency}
                onChange={(e) => setInput({ ...input, gtEfficiency: parseFloat(e.target.value) })}
                className="w-full bg-dark-light border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">燃气锅炉效率</label>
              <input
                type="number"
                step="0.01"
                value={input.gbEfficiency}
                onChange={(e) => setInput({ ...input, gbEfficiency: parseFloat(e.target.value) })}
                className="w-full bg-dark-light border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">热泵COP</label>
              <input
                type="number"
                step="0.1"
                value={input.hpCOP}
                onChange={(e) => setInput({ ...input, hpCOP: parseFloat(e.target.value) })}
                className="w-full bg-dark-light border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* 储能参数 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-secondary">储能参数</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">电储能容量 (kWh)</label>
              <input
                type="number"
                value={input.esCapacity}
                onChange={(e) => setInput({ ...input, esCapacity: parseFloat(e.target.value) })}
                className="w-full bg-dark-light border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-secondary"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">热储能容量 (kWh)</label>
              <input
                type="number"
                value={input.hsCapacity}
                onChange={(e) => setInput({ ...input, hsCapacity: parseFloat(e.target.value) })}
                className="w-full bg-dark-light border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-secondary"
              />
            </div>
          </div>
        </div>

        {/* 碳交易参数 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-accent">碳交易参数</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">碳交易价格 (元/吨)</label>
              <input
                type="number"
                step="0.1"
                value={input.carbonPrice}
                onChange={(e) => setInput({ ...input, carbonPrice: parseFloat(e.target.value) })}
                className="w-full bg-dark-light border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-accent"
              />
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={input.drEnabled}
                onChange={(e) => setInput({ ...input, drEnabled: e.target.checked })}
                className="w-5 h-5 rounded border-white/10 bg-dark-light"
              />
              <label className="text-sm">启用需求响应</label>
            </div>
          </div>
        </div>

        {/* 提交按钮 */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90 disabled:opacity-50 rounded-lg px-6 py-3 font-semibold transition-opacity"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>优化计算中...</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              <span>开始优化</span>
            </>
          )}
        </button>
      </form>
    </div>
  )
}
