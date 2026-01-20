// 优化输入参数
export interface OptimizationInput {
  // 24小时负荷数据
  electricLoad: number[]
  heatLoad: number[]

  // 可再生能源预测
  pvPower: number[]
  wtPower: number[]

  // 价格数据
  electricPriceBefore: number[]
  electricPriceAfter: number[]
  heatPriceBefore: number[]
  heatPriceAfter: number[]
  gridBuyPrice: number[]
  gridSellPrice: number[]

  // 设备参数
  gtEfficiency: number
  gbEfficiency: number
  hpCOP: number

  // 储能参数
  esCapacity: number
  hsCapacity: number

  // 碳交易价格
  carbonPrice: number

  // 需求响应参数
  drEnabled: boolean
}

// 优化结果
export interface OptimizationResult {
  // 总成本
  totalCost: number
  operationCost: number
  energyCost: number
  carbonCost: number

  // 碳排放
  carbonEmission: number

  // 设备出力
  gtPower: number[]
  gbPower: number[]
  hpPower: number[]

  // 储能状态
  esCharge: number[]
  esDischarge: number[]
  esState: number[]
  hsCharge: number[]
  hsDischarge: number[]
  hsState: number[]

  // 电网交互
  gridBuy: number[]
  gridSell: number[]

  // 优化后负荷
  optimizedElectricLoad: number[]
  optimizedHeatLoad: number[]

  // AI分析建议
  aiAnalysis?: string
}

// 千问API配置
export interface QwenConfig {
  apiKey: string
  model: string
}
