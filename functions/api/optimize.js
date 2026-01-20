/**
 * 边缘函数: 综合能源系统优化计算
 * 路径: /api/optimize
 */

export default async function handler(request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: '仅支持POST请求' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  try {
    const input = await request.json()

    // 执行优化计算
    const result = await optimizeEnergySystem(input)

    // 如果提供了千问API Key，调用AI分析
    if (input.qwenApiKey) {
      try {
        result.aiAnalysis = await getAIAnalysis(result, input.qwenApiKey)
      } catch (error) {
        console.error('AI分析失败:', error)
        result.aiAnalysis = '暂无AI分析（API调用失败）'
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('优化计算失败:', error)
    return new Response(JSON.stringify({ error: error.message || '优化计算失败' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}

// 综合能源系统优化算法（基于MATLAB模型的JavaScript实现）
async function optimizeEnergySystem(input) {
  const {
    electricLoad,
    heatLoad,
    pvPower,
    wtPower,
    gridBuyPrice,
    gridSellPrice,
    gtEfficiency,
    gbEfficiency,
    hpCOP,
    esCapacity,
    hsCapacity,
    carbonPrice,
    drEnabled
  } = input

  // 初始化结果数组
  const gtPower = new Array(24).fill(0)
  const gbPower = new Array(24).fill(0)
  const hpPower = new Array(24).fill(0)
  const esCharge = new Array(24).fill(0)
  const esDischarge = new Array(24).fill(0)
  const esState = new Array(24).fill(0)
  const hsCharge = new Array(24).fill(0)
  const hsDischarge = new Array(24).fill(0)
  const hsState = new Array(24).fill(0)
  const gridBuy = new Array(24).fill(0)
  const gridSell = new Array(24).fill(0)

  // 储能初始状态
  let esCurrentState = esCapacity * 0.2
  let hsCurrentState = hsCapacity * 0.125

  // 设备参数
  const gtHeatEfficiency = 0.4
  const whbEfficiency = 0.8
  const orcEfficiency = 0.8
  const esChargeEff = 0.95
  const esDischargeEff = 0.9
  const hsChargeEff = 0.95
  const hsDischargeEff = 0.9
  const gasHeatValue = 9.88
  const gasPrice = 2.55
  const carbonCoef = 2.53

  let totalOperationCost = 0
  let totalEnergyCost = 0
  let totalCarbonCost = 0
  let totalCarbonEmission = 0

  // 逐时段优化
  for (let t = 0; t < 24; t++) {
    const eLoad = electricLoad[t]
    const hLoad = heatLoad[t]
    const pv = pvPower[t]
    const wt = wtPower[t]
    const buyPrice = gridBuyPrice[t]
    const sellPrice = gridSellPrice[t]

    // 可再生能源优先
    let netElectricLoad = eLoad - pv - wt

    // 简化的优化策略：根据电价和负荷决策
    if (netElectricLoad > 0) {
      // 需要供电
      if (buyPrice > 0.8) {
        // 电价高时，优先使用燃气轮机和储能
        const gtOutput = Math.min(netElectricLoad * 0.6, 4000)
        gtPower[t] = gtOutput

        // 储能放电
        const esDischargeMax = Math.min(esCurrentState * esDischargeEff, 250, netElectricLoad - gtOutput * gtEfficiency)
        esDischarge[t] = Math.max(0, esDischargeMax)
        esCurrentState -= esDischarge[t] / esDischargeEff

        // 剩余从电网购买
        gridBuy[t] = Math.max(0, netElectricLoad - gtOutput * gtEfficiency - esDischarge[t])
      } else {
        // 电价低时，优先从电网购买
        gridBuy[t] = netElectricLoad

        // 同时给储能充电
        const esChargeMax = Math.min((esCapacity - esCurrentState) / esChargeEff, 250)
        esCharge[t] = esChargeMax
        esCurrentState += esCharge[t] * esChargeEff
        gridBuy[t] += esCharge[t]
      }
    } else {
      // 有多余电力，卖给电网或储能
      const surplus = -netElectricLoad
      const esChargeMax = Math.min((esCapacity - esCurrentState) / esChargeEff, 250, surplus)
      esCharge[t] = esChargeMax
      esCurrentState += esCharge[t] * esChargeEff
      gridSell[t] = surplus - esCharge[t]
    }

    esState[t] = esCurrentState

    // 热负荷平衡
    let netHeatLoad = hLoad

    // 如果有燃气轮机运行，利用余热
    if (gtPower[t] > 0) {
      const wasteHeat = gtPower[t] * gtHeatEfficiency * whbEfficiency * 0.5
      netHeatLoad -= wasteHeat
    }

    if (netHeatLoad > 0) {
      // 需要供热
      if (buyPrice < 0.6) {
        // 电价低时，优先使用热泵
        const hpOutput = Math.min(netHeatLoad * 0.5, 400)
        hpPower[t] = hpOutput / hpCOP
        netHeatLoad -= hpOutput * hpCOP
        gridBuy[t] += hpPower[t]
      }

      // 燃气锅炉补充
      if (netHeatLoad > 0) {
        gbPower[t] = Math.min(netHeatLoad / gbEfficiency, 1000)
        netHeatLoad -= gbPower[t] * gbEfficiency
      }

      // 热储能放热
      if (netHeatLoad > 0) {
        const hsDischargeMax = Math.min(hsCurrentState * hsDischargeEff, 250, netHeatLoad)
        hsDischarge[t] = hsDischargeMax
        hsCurrentState -= hsDischarge[t] / hsDischargeEff
      }
    } else {
      // 有多余热量，储存
      const heatSurplus = -netHeatLoad
      const hsChargeMax = Math.min((hsCapacity - hsCurrentState) / hsChargeEff, 250, heatSurplus)
      hsCharge[t] = hsChargeMax
      hsCurrentState += hsCharge[t] * hsChargeEff
    }

    hsState[t] = hsCurrentState

    // 成本计算
    const omCost = gtPower[t] * 0.04 + gbPower[t] * 0.025 + hpPower[t] * 0.025 +
                   pv * 0.016 + wt * 0.018 +
                   (esCharge[t] + esDischarge[t]) * 0.018 +
                   (hsCharge[t] + hsDischarge[t]) * 0.016

    const energyCost = gridBuy[t] * buyPrice - gridSell[t] * sellPrice +
                       gasPrice * (gtPower[t] / gtEfficiency / gasHeatValue + gbPower[t] / gbEfficiency / gasHeatValue)

    const carbonEmission = carbonCoef * gtEfficiency * gtPower[t] + gtHeatEfficiency * gtPower[t] + gbPower[t]
    const carbonCost = carbonPrice * (0.57 - 0.6101) * carbonEmission

    totalOperationCost += omCost
    totalEnergyCost += energyCost
    totalCarbonCost += carbonCost
    totalCarbonEmission += carbonEmission
  }

  const totalCost = totalOperationCost + totalEnergyCost + totalCarbonCost

  return {
    totalCost,
    operationCost: totalOperationCost,
    energyCost: totalEnergyCost,
    carbonCost: totalCarbonCost,
    carbonEmission: totalCarbonEmission,
    gtPower,
    gbPower,
    hpPower,
    esCharge,
    esDischarge,
    esState,
    hsCharge,
    hsDischarge,
    hsState,
    gridBuy,
    gridSell,
    optimizedElectricLoad: electricLoad,
    optimizedHeatLoad: heatLoad
  }
}

// 调用千问API进行智能分析
async function getAIAnalysis(result, apiKey) {
  const prompt = `作为能源系统专家，请分析以下综合能源系统优化结果：

总成本: ${result.totalCost.toFixed(2)} 元
- 运维成本: ${result.operationCost.toFixed(2)} 元
- 能源成本: ${result.energyCost.toFixed(2)} 元
- 碳交易成本: ${result.carbonCost.toFixed(2)} 元

碳排放: ${result.carbonEmission.toFixed(2)} 吨

请提供：
1. 成本结构分析
2. 碳排放评估
3. 优化建议（设备调度、储能策略、需求响应等）
4. 经济性和环保性综合评价

请用简洁专业的语言回答，控制在200字以内。`

  const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'qwen-turbo',
      input: { prompt },
      parameters: { max_tokens: 500 }
    })
  })

  if (!response.ok) {
    throw new Error('千问API调用失败')
  }

  const data = await response.json()
  return data.output?.text || '分析生成失败'
}
