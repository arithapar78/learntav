/**
 * Enhanced AI Model Energy Database
 * Based on comprehensive backend energy consumption data
 * Contains real-world energy consumption, carbon emissions, and environmental impact data
 */

// Parse and structure the backend CSV data into a comprehensive model database
const ENHANCED_AI_MODEL_DATABASE = {
  // OpenAI Models
  'gpt-5-high': {
    name: 'GPT-5 (High Performance)',
    company: 'OpenAI',
    size: 'Large',
    contextWindow: 400000,
    apiId: 'gpt-5-2025-08-07',
    aiIntelligenceIndex: 69.0,
    
    // Performance Benchmarks
    benchmarks: {
      longContextReasoning: 76,
      aime2024: 96,
      math500: 99,
      humanEval: 99
    },
    
    // Energy Consumption (Wh per query)
    energy: {
      meanMax: 11.620659451847496,
      meanMin: 9.781063891979056,
      meanCombined: 10.700861671913275,
      stdMax: 5.546749801695986,
      stdMin: 4.668677748282628,
      stdCombined: 5.20840864333184
    },
    
    // Carbon Emissions (gCO2e per query)
    carbon: {
      meanMax: 4.099768654611796,
      meanMin: 3.4507593410902104,
      meanCombined: 3.775263997851004,
      stdMax: 1.9568933300383438,
      stdMin: 1.6471095095941108,
      stdCombined: 1.837526569367473
    },
    
    // Water Consumption (mL per query) - Site & Source combined
    water: {
      meanMax: 36.51211199770482,
      meanMin: 30.732102748598194,
      meanCombined: 33.62210737315151,
      stdMax: 17.427887876928786,
      stdMin: 14.668985485104015,
      stdCombined: 16.36481995734864
    },
    
    // Large scale impact metrics (per billion prompts)
    scaleImpact: {
      energyMWh: 10700.861671913275,
      carbonTonsCO2e: 3775.2639978510038,
      waterKiloliters: 36488.40960669971,
      householdEnergyEquiv: 9772.476412706188,
      universitiesEquiv: 8.902547148014373,
      olympicPoolsWater: 14.595363842679884,
      gasolineCarEquiv: 820.7095647502183,
      atlanticFlightEquiv: 62.92106663085006
    },
    
    // Hardware and Infrastructure
    hardware: {
      type: 'DGX H200/H100',
      host: 'Azure',
      gpuPowerDraw: 5.6,
      nonGpuPowerDraw: 4.6,
      pue: 1.12,
      wueSite: 0.3,
      wueSource: 3.142,
      carbonIntensityFactor: 0.3528
    },
    
    // Performance Metrics
    performance: {
      medianTokensPerSecond: 165.0,
      medianFirstChunk: 37.34,
      queryLength: 'Short (300 tokens)'
    },
    
    pricing: '$0.030/1k tokens',
    sites: ['chat.openai.com', 'chatgpt.com', 'openai.com', 'platform.openai.com'],
    detectionPatterns: [
      /gpt-?5/i,
      /gpt.*5.*high/i,
      /chatgpt.*5/i
    ],
    category: 'frontier-large'
  },

  'gpt-5-medium': {
    name: 'GPT-5 (Medium Performance)',
    company: 'OpenAI',
    size: 'Large',
    contextWindow: 400000,
    apiId: 'gpt-5-2025-08-07',
    aiIntelligenceIndex: 68.0,
    
    benchmarks: {
      longContextReasoning: 73,
      aime2024: 92,
      math500: 99,
      humanEval: 98
    },
    
    energy: {
      meanMax: 4.396310830559365,
      meanMin: 3.700357737947846,
      meanCombined: 4.048334284253605,
      stdMax: 1.1535027983785902,
      stdMin: 0.9708988218154773,
      stdCombined: 1.1214697012464687
    },
    
    carbon: {
      meanMax: 1.5510184610213436,
      meanMin: 1.305486209948,
      meanCombined: 1.4282523354846726,
      stdMax: 0.40695578726796655,
      stdMin: 0.3425331043365003,
      stdCombined: 0.39565451059975426
    },
    
    water: {
      meanMax: 13.813208629617524,
      meanMin: 11.62652401263213,
      meanCombined: 12.719866321124826,
      stdMax: 3.6243057925055293,
      stdMin: 3.0505640981442292,
      stdCombined: 3.523657801316405
    },
    
    scaleImpact: {
      energyMWh: 4048.3342842536053,
      carbonTonsCO2e: 1428.2523354846726,
      waterKiloliters: 13804.241575835616,
      householdEnergyEquiv: 3697.1089353914203,
      universitiesEquiv: 3.367998572590354,
      olympicPoolsWater: 5.5216966303342465,
      gasolineCarEquiv: 310.4896381488419,
      atlanticFlightEquiv: 23.80420559141121
    },
    
    hardware: {
      type: 'DGX H200/H100',
      host: 'Azure',
      gpuPowerDraw: 5.6,
      nonGpuPowerDraw: 4.6,
      pue: 1.12,
      wueSite: 0.3,
      wueSource: 3.142,
      carbonIntensityFactor: 0.3528
    },
    
    performance: {
      medianTokensPerSecond: 198.7,
      medianFirstChunk: 17.01,
      queryLength: 'Short (300 tokens)'
    },
    
    pricing: '$0.020/1k tokens',
    sites: ['chat.openai.com', 'chatgpt.com', 'openai.com'],
    detectionPatterns: [
      /gpt-?5.*medium/i,
      /gpt.*5/i
    ],
    category: 'frontier-large'
  },

  'gpt-5-mini': {
    name: 'GPT-5 Mini',
    company: 'OpenAI',
    size: 'Medium',
    contextWindow: 400000,
    apiId: 'gpt-5-mini-2025-08-07',
    aiIntelligenceIndex: 64.0,
    
    benchmarks: {
      longContextReasoning: 66,
      aime2024: null,
      math500: null,
      humanEval: null
    },
    
    energy: {
      meanMax: 2.3406137816613373,
      meanMin: 1.8438063081059304,
      meanCombined: 2.092210044883634,
      stdMax: 0.6622813114999883,
      stdMin: 0.5217086515732694,
      stdCombined: 0.6458348417276651
    },
    
    carbon: {
      meanMax: 0.8257685421701199,
      meanMin: 0.6504948654997722,
      meanCombined: 0.7381317038349461,
      stdMax: 0.23365284669719588,
      stdMin: 0.18405881227504942,
      stdCombined: 0.2278505321615203
    },
    
    water: {
      meanMax: 7.354208501979923,
      meanMin: 5.793239420068834,
      meanCombined: 6.5737239610243785,
      stdMax: 2.0808878807329627,
      stdMin: 1.639208583243212,
      stdCombined: 2.0292130727083237
    },
    
    scaleImpact: {
      energyMWh: 2092.2100448836336,
      carbonTonsCO2e: 738.131703834946,
      waterKiloliters: 7134.137365903923,
      householdEnergyEquiv: 1910.6941049165605,
      universitiesEquiv: 1.740607358472241,
      olympicPoolsWater: 2.8536549463615692,
      gasolineCarEquiv: 160.4634138771622,
      atlanticFlightEquiv: 12.302195063915768
    },
    
    hardware: {
      type: 'DGX H200/H100',
      host: 'Azure',
      gpuPowerDraw: 5.6,
      nonGpuPowerDraw: 4.6,
      pue: 1.12,
      wueSite: 0.3,
      wueSource: 3.142,
      carbonIntensityFactor: 0.3528
    },
    
    performance: {
      medianTokensPerSecond: 79.0,
      medianFirstChunk: 12.13,
      queryLength: 'Short (300 tokens)'
    },
    
    pricing: '$0.005/1k tokens',
    sites: ['chat.openai.com', 'chatgpt.com', 'openai.com'],
    detectionPatterns: [
      /gpt-?5.*mini/i,
      /gpt.*mini/i
    ],
    category: 'efficient-medium'
  },

  'o3': {
    name: 'OpenAI o3',
    company: 'OpenAI',
    size: 'Large',
    contextWindow: 200000,
    apiId: 'o3-2025-04-16',
    aiIntelligenceIndex: 67.0,
    
    benchmarks: {
      longContextReasoning: 69,
      aime2024: 90,
      math500: 99,
      humanEval: 99
    },
    
    energy: {
      meanMax: 1.2565837323545013,
      meanMin: 1.0576616432750605,
      meanCombined: 1.157122687814781,
      stdMax: 0.37156369387563154,
      stdMin: 0.3127437168946128,
      stdCombined: 0.35752846727598225
    },
    
    carbon: {
      meanMax: 0.443322740774668,
      meanMin: 0.3731430277474414,
      meanCombined: 0.40823288426105475,
      stdMax: 0.1310876711993228,
      stdMin: 0.1103359833204194,
      stdCombined: 0.12613604325496652
    },
    
    water: {
      meanMax: 3.948186087057843,
      meanMin: 3.32317288317024,
      meanCombined: 3.635679485114041,
      stdMax: 1.1674531261572343,
      stdMin: 0.9826407584828736,
      stdCombined: 1.1233544441811363
    },
    
    scaleImpact: {
      energyMWh: 1157.1226878147809,
      carbonTonsCO2e: 408.2328842610548,
      waterKiloliters: 3945.6230622072867,
      householdEnergyEquiv: 1056.7330482326765,
      universitiesEquiv: 0.9626644657360905,
      olympicPoolsWater: 1.5782492248829147,
      gasolineCarEquiv: 88.74627918718583,
      atlanticFlightEquiv: 6.803881404350913
    },
    
    hardware: {
      type: 'DGX H200/H100',
      host: 'Azure',
      gpuPowerDraw: 5.6,
      nonGpuPowerDraw: 4.6,
      pue: 1.12,
      wueSite: 0.3,
      wueSource: 3.142,
      carbonIntensityFactor: 0.3528
    },
    
    performance: {
      medianTokensPerSecond: 237.3,
      medianFirstChunk: 3.74,
      queryLength: 'Short (300 tokens)'
    },
    
    pricing: '$0.050/1k tokens',
    sites: ['chat.openai.com', 'openai.com'],
    detectionPatterns: [
      /o3/i,
      /openai.*o3/i
    ],
    category: 'reasoning-optimized'
  },

  'o4-mini-high': {
    name: 'OpenAI o4-mini (High)',
    company: 'OpenAI',
    size: 'Medium',
    contextWindow: 200000,
    apiId: 'o4-mini-2025-04-16',
    aiIntelligenceIndex: 65.0,
    
    benchmarks: {
      longContextReasoning: 55,
      aime2024: 94,
      math500: 99,
      humanEval: 99
    },
    
    energy: {
      meanMax: 2.769351861619209,
      meanMin: 2.1815424961712915,
      meanCombined: 2.47544717889525,
      stdMax: 1.3031747869872587,
      stdMin: 1.026569146792869,
      stdCombined: 1.2093115114891755
    },
    
    carbon: {
      meanMax: 0.9770273367792569,
      meanMin: 0.7696481926492315,
      meanCombined: 0.8733377647142441,
      stdMax: 0.4597600648491049,
      stdMin: 0.3621735949885242,
      stdCombined: 0.4266451012533811
    },
    
    water: {
      meanMax: 8.701303549207555,
      meanMin: 6.854406522970197,
      meanCombined: 7.777855036088875,
      stdMax: 4.094575180713967,
      stdMin: 3.225480259223194,
      stdCombined: 3.799656769098989
    },
    
    scaleImpact: {
      energyMWh: 2475.44717889525,
      carbonTonsCO2e: 873.337764714244,
      waterKiloliters: 8440.921244721532,
      householdEnergyEquiv: 2260.6823551554794,
      universitiesEquiv: 2.0594402486649335,
      olympicPoolsWater: 3.376368497888613,
      gasolineCarEquiv: 189.85603580744436,
      atlanticFlightEquiv: 14.555629411904068
    },
    
    hardware: {
      type: 'DGX H200/H100',
      host: 'Azure',
      gpuPowerDraw: 5.6,
      nonGpuPowerDraw: 4.6,
      pue: 1.12,
      wueSite: 0.3,
      wueSource: 3.142,
      carbonIntensityFactor: 0.3528
    },
    
    performance: {
      medianTokensPerSecond: 116.4,
      medianFirstChunk: 19.22,
      queryLength: 'Short (300 tokens)'
    },
    
    pricing: '$0.010/1k tokens',
    sites: ['chat.openai.com', 'openai.com'],
    detectionPatterns: [
      /o4.*mini/i,
      /o4/i
    ],
    category: 'efficient-reasoning'
  },

  // Anthropic Claude Models
  'claude-4-sonnet-thinking': {
    name: 'Claude 4 Sonnet (Thinking)',
    company: 'Anthropic',
    size: 'Large',
    contextWindow: 1000000,
    apiId: 'claude-sonnet-4-20250514',
    aiIntelligenceIndex: 59.0,
    
    benchmarks: {
      longContextReasoning: 65,
      aime2024: 77,
      math500: 99,
      humanEval: null
    },
    
    energy: {
      meanMax: 1.5029903643709916,
      meanMin: 1.2650611476790463,
      meanCombined: 1.3840257560250186,
      stdMax: 0.37071676473294884,
      stdMin: 0.3120308599271675,
      stdCombined: 0.362697762109703
    },
    
    carbon: {
      meanMax: 0.5786512902828318,
      meanMin: 0.4870485418564328,
      meanCombined: 0.5328499160696323,
      stdMax: 0.1427259544221853,
      stdMin: 0.12013188107195949,
      stdCombined: 0.13963863841223567
    },
    
    water: {
      meanMax: 4.722395724853655,
      meanMin: 3.974822126007563,
      meanCombined: 4.348608925430609,
      stdMax: 1.1647920747909253,
      stdMin: 0.9804009618911602,
      stdCombined: 1.139596368548687
    },
    
    scaleImpact: {
      energyMWh: 1384.0257560250186,
      carbonTonsCO2e: 532.8499160696323,
      waterKiloliters: 4567.139307960876,
      householdEnergyEquiv: 1263.9504621233048,
      universitiesEquiv: 1.1514357371256394,
      olympicPoolsWater: 1.8268557231843505,
      gasolineCarEquiv: 115.83693827600703,
      atlanticFlightEquiv: 8.880831934493871
    },
    
    hardware: {
      type: 'DGX H200/H100',
      host: 'Anthropic',
      gpuPowerDraw: 5.6,
      nonGpuPowerDraw: 4.6,
      pue: 1.14,
      wueSite: 0.18,
      wueSource: 3.142,
      carbonIntensityFactor: 0.385
    },
    
    performance: {
      medianTokensPerSecond: 63.6,
      medianFirstChunk: 1.17,
      queryLength: 'Short (300 tokens)'
    },
    
    pricing: '$0.015/1k tokens',
    sites: ['claude.ai', 'anthropic.com'],
    detectionPatterns: [
      /claude.*4.*sonnet.*thinking/i,
      /claude.*thinking/i,
      /claude.*4/i
    ],
    category: 'reasoning-focused'
  },

  'claude-4-opus-thinking': {
    name: 'Claude 4 Opus (Thinking)',
    company: 'Anthropic',
    size: 'Large',
    contextWindow: 200000,
    apiId: 'claude-opus-4-20250514',
    aiIntelligenceIndex: 55.0,
    
    benchmarks: {
      longContextReasoning: 34,
      aime2024: 76,
      math500: 98,
      humanEval: null
    },
    
    energy: {
      meanMax: 3.3203642530243633,
      meanMin: 2.7947376857611417,
      meanCombined: 3.0575509693927527,
      stdMax: 1.311898287575464,
      stdMin: 1.104219689400973,
      stdCombined: 1.2406691508034433
    },
    
    carbon: {
      meanMax: 1.2783402374143797,
      meanMin: 1.0759740090180394,
      meanCombined: 1.1771571232162097,
      stdMax: 0.5050808407165536,
      stdMin: 0.4251245804193747,
      stdCombined: 0.47765762305932563
    },
    
    water: {
      meanMax: 10.43258448300255,
      meanMin: 8.781065808661507,
      meanCombined: 9.606825145832028,
      stdMax: 4.121984419562107,
      stdMin: 3.4694582640978577,
      stdCombined: 3.898182471824419
    },
    
    scaleImpact: {
      energyMWh: 3057.550969392753,
      carbonTonsCO2e: 1177.1571232162096,
      waterKiloliters: 10089.59635152562,
      householdEnergyEquiv: 2792.2839903130166,
      universitiesEquiv: 2.5437196084798277,
      olympicPoolsWater: 4.035838540610248,
      gasolineCarEquiv: 255.90372243830646,
      atlanticFlightEquiv: 19.619285386936827
    },
    
    hardware: {
      type: 'DGX H200/H100',
      host: 'Anthropic',
      gpuPowerDraw: 5.6,
      nonGpuPowerDraw: 4.6,
      pue: 1.14,
      wueSite: 0.18,
      wueSource: 3.142,
      carbonIntensityFactor: 0.385
    },
    
    performance: {
      medianTokensPerSecond: 30.2,
      medianFirstChunk: 1.7,
      queryLength: 'Short (300 tokens)'
    },
    
    pricing: '$0.030/1k tokens',
    sites: ['claude.ai', 'anthropic.com'],
    detectionPatterns: [
      /claude.*4.*opus.*thinking/i,
      /claude.*opus.*thinking/i,
      /claude.*opus.*4/i
    ],
    category: 'high-capability'
  },

  // xAI Grok Models
  'grok-4': {
    name: 'Grok 4',
    company: 'xAI',
    size: 'Large',
    contextWindow: 256000,
    apiId: 'grok-4-0709',
    aiIntelligenceIndex: 68.0,
    
    benchmarks: {
      longContextReasoning: 68,
      aime2024: 94,
      math500: 99,
      humanEval: 98
    },
    
    energy: {
      meanMax: 3.983662395487847,
      meanMin: 3.353033154081997,
      meanCombined: 3.6683477747849227,
      stdMax: 0.6073373731609465,
      stdMin: 0.5111935063142664,
      stdCombined: 0.6438261045476379
    },
    
    carbon: {
      meanMax: 1.5337100222628215,
      meanMin: 1.2909177643215688,
      meanCombined: 1.4123138932921953,
      stdMax: 0.23382488866696438,
      stdMin: 0.1968094999309926,
      stdCombined: 0.2478730502508406
    },
    
    water: {
      meanMax: 12.51666724662282,
      meanMin: 10.535230170125635,
      meanCombined: 11.525948708374225,
      stdMax: 1.9082540264716936,
      stdMin: 1.6061699968394252,
      stdCombined: 2.0229016204886783
    },
    
    scaleImpact: {
      energyMWh: 3668.347774784923,
      carbonTonsCO2e: 1412.3138932921952,
      waterKiloliters: 12406.352174322608,
      householdEnergyEquiv: 3350.0892920410256,
      universitiesEquiv: 3.0518700289392036,
      olympicPoolsWater: 4.962540869729043,
      gasolineCarEquiv: 307.0247594113468,
      atlanticFlightEquiv: 23.538564888203254
    },
    
    hardware: {
      type: 'DGX H200/H100',
      host: 'xAI',
      gpuPowerDraw: 5.6,
      nonGpuPowerDraw: 4.6,
      pue: 1.5,
      wueSite: 0.36,
      wueSource: 3.142,
      carbonIntensityFactor: 0.385
    },
    
    performance: {
      medianTokensPerSecond: 61.5,
      medianFirstChunk: 7.97,
      queryLength: 'Short (300 tokens)'
    },
    
    pricing: '$0.025/1k tokens',
    sites: ['grok.x.ai', 'x.ai'],
    detectionPatterns: [
      /grok.*4/i,
      /grok/i,
      /x\.ai/i
    ],
    category: 'frontier-large'
  },

  'grok-3-mini-reasoning': {
    name: 'Grok 3 Mini (Reasoning)',
    company: 'xAI',
    size: 'Medium',
    contextWindow: 131000,
    apiId: 'grok-3-mini-beta',
    aiIntelligenceIndex: 58.0,
    
    benchmarks: {
      longContextReasoning: 50,
      aime2024: 93,
      math500: 99,
      humanEval: 98
    },
    
    energy: {
      meanMax: 0.3575785646495295,
      meanMin: 0.2816806507378163,
      meanCombined: 0.319629607693673,
      stdMax: 0.023423564404341977,
      stdMin: 0.018451790784721697,
      stdCombined: 0.04341300853800856
    },
    
    carbon: {
      meanMax: 0.13766774739006887,
      meanMin: 0.1084470505340593,
      meanCombined: 0.12305739896206408,
      stdMax: 0.009018072295671663,
      stdMin: 0.0071039394521178545,
      stdCombined: 0.0167140082871333
    },
    
    water: {
      meanMax: 1.1235118501288217,
      meanMin: 0.8850406046182189,
      meanCombined: 1.0042762273735204,
      stdMax: 0.07359683935844248,
      stdMin: 0.05797552664559558,
      stdCombined: 0.13640367282642288
    },
    
    scaleImpact: {
      energyMWh: 319.629607693673,
      carbonTonsCO2e: 123.05739896206408,
      waterKiloliters: 1080.987333220002,
      householdEnergyEquiv: 291.8991851083772,
      universitiesEquiv: 0.26591481505297254,
      olympicPoolsWater: 0.4323949332880008,
      gasolineCarEquiv: 26.751608470013934,
      atlanticFlightEquiv: 2.050956649367735
    },
    
    hardware: {
      type: 'DGX H200/H100',
      host: 'xAI',
      gpuPowerDraw: 5.6,
      nonGpuPowerDraw: 4.6,
      pue: 1.5,
      wueSite: 0.36,
      wueSource: 3.142,
      carbonIntensityFactor: 0.385
    },
    
    performance: {
      medianTokensPerSecond: 187.6,
      medianFirstChunk: 0.55,
      queryLength: 'Short (300 tokens)'
    },
    
    pricing: '$0.005/1k tokens',
    sites: ['grok.x.ai', 'x.ai'],
    detectionPatterns: [
      /grok.*3.*mini.*reasoning/i,
      /grok.*mini.*reasoning/i,
      /grok.*3.*mini/i
    ],
    category: 'efficient-reasoning'
  },

  // DeepSeek Models
  'deepseek-r1': {
    name: 'DeepSeek R1 (Reasoning)',
    company: 'DeepSeek',
    size: 'Large',
    contextWindow: 128000,
    apiId: 'deepseek-reasoner',
    aiIntelligenceIndex: 60.0,
    
    benchmarks: {
      longContextReasoning: 53,
      aime2024: null,
      math500: null,
      humanEval: null
    },
    
    energy: {
      meanMax: 29.15769820295388,
      meanMin: 24.541921243617004,
      meanCombined: 26.849809723285443,
      stdMax: 16.205480555741108,
      stdMin: 13.640089994266894,
      stdCombined: 15.154576100362815
    },
    
    carbon: {
      meanMax: 17.494618921772325,
      meanMin: 14.725152746170203,
      meanCombined: 16.109885833971266,
      stdMax: 9.723288333444664,
      stdMin: 8.184053996560136,
      stdCombined: 9.09274566021769
    },
    
    water: {
      meanMax: 175.4127123889705,
      meanMin: 147.64419820159992,
      meanCombined: 161.5284552952852,
      stdMax: 97.4921710233385,
      stdMin: 82.05878140550963,
      stdCombined: 91.16992981978268
    },
    
    scaleImpact: {
      energyMWh: 26849.80972328544,
      carbonTonsCO2e: 16109.885833971266,
      waterKiloliters: 186898.35424642105,
      householdEnergyEquiv: 24520.374176516387,
      universitiesEquiv: 22.337612082600202,
      olympicPoolsWater: 74.75934169856842,
      gasolineCarEquiv: 3502.1490943415797,
      atlanticFlightEquiv: 268.49809723285443
    },
    
    hardware: {
      type: 'DGX H800',
      host: 'DeepSeek',
      gpuPowerDraw: 5.6,
      nonGpuPowerDraw: 4.6,
      pue: 1.27,
      wueSite: 1.2,
      wueSource: 6.016,
      carbonIntensityFactor: 0.6
    },
    
    performance: {
      medianTokensPerSecond: 20.2,
      medianFirstChunk: 101.89,
      queryLength: 'Short (300 tokens)'
    },
    
    pricing: '$0.014/1k tokens',
    sites: ['chat.deepseek.com', 'platform.deepseek.com'],
    detectionPatterns: [
      /deepseek.*r1/i,
      /deepseek.*reasoning/i,
      /deepseek/i
    ],
    category: 'reasoning-specialized'
  },

  'deepseek-v3': {
    name: 'DeepSeek V3',
    company: 'DeepSeek',
    size: 'Large',
    contextWindow: 128000,
    apiId: 'deepseek-chat',
    aiIntelligenceIndex: 49.0,
    
    benchmarks: {
      longContextReasoning: 45,
      aime2024: null,
      math500: null,
      humanEval: null
    },
    
    energy: {
      meanMax: 4.457247702930414,
      meanMin: 3.7516480665654566,
      meanCombined: 4.104447884747935,
      stdMax: 0.30389762513857466,
      stdMin: 0.25578944985161994,
      stdCombined: 0.45095311986914977
    },
    
    carbon: {
      meanMax: 2.6743486217582477,
      meanMin: 2.250988839939274,
      meanCombined: 2.4626687308487614,
      stdMax: 0.18233857508314477,
      stdMin: 0.153473669910972,
      stdCombined: 0.27057187192148985
    },
    
    water: {
      meanMax: 26.81480218082937,
      meanMin: 22.569914768457785,
      meanCombined: 24.692358474643584,
      stdMax: 1.8282481128336647,
      stdMin: 1.5388293303073455,
      stdCombined: 2.712933969132805
    },
    
    scaleImpact: {
      energyMWh: 4104.447884747935,
      carbonTonsCO2e: 2462.6687308487612,
      waterKiloliters: 28570.576948421156,
      householdEnergyEquiv: 3748.354232646516,
      universitiesEquiv: 3.4146821004558525,
      olympicPoolsWater: 11.428230779368462,
      gasolineCarEquiv: 535.3627675758177,
      atlanticFlightEquiv: 41.044478847479354
    },
    
    hardware: {
      type: 'DGX H800',
      host: 'DeepSeek',
      gpuPowerDraw: 5.6,
      nonGpuPowerDraw: 4.6,
      pue: 1.27,
      wueSite: 1.2,
      wueSource: 6.016,
      carbonIntensityFactor: 0.6
    },
    
    performance: {
      medianTokensPerSecond: 20.3,
      medianFirstChunk: 3.03,
      queryLength: 'Short (300 tokens)'
    },
    
    pricing: '$0.008/1k tokens',
    sites: ['chat.deepseek.com', 'platform.deepseek.com'],
    detectionPatterns: [
      /deepseek.*v3/i,
      /deepseek.*chat/i,
      /deepseek/i
    ],
    category: 'efficient-large'
  },

  // Meta Llama Models
  'llama-4-maverick': {
    name: 'Llama 4 Maverick',
    company: 'Meta',
    size: 'Micro',
    contextWindow: 128000,
    apiId: 'us.meta.llama4-maverick-17b-instruct-v1:0',
    aiIntelligenceIndex: 42.0,
    
    benchmarks: {
      longContextReasoning: 46,
      aime2024: 39,
      math500: 89,
      humanEval: 88
    },
    
    energy: {
      meanMax: 0.050504846968538596,
      meanMin: 0.03765140472968129,
      meanCombined: 0.04407812584910994,
      stdMax: 0.006138147494089222,
      stdMin: 0.004575993978051244,
      stdCombined: 0.008403037077157746
    },
    
    carbon: {
      meanMax: 0.019444366082887358,
      meanMin: 0.014495790820927296,
      meanCombined: 0.01697007845190733,
      stdMax: 0.0023631867852243506,
      stdMin: 0.0017617576815497288,
      stdCombined: 0.0032351692747057325
    },
    
    water: {
      meanMax: 0.15868622917514827,
      meanMin: 0.11830071366065861,
      meanCombined: 0.13849347141790344,
      stdMax: 0.019286059426428335,
      stdMin: 0.014377773079037006,
      stdCombined: 0.026402342496429636
    },
    
    scaleImpact: {
      energyMWh: 44.07812584910994,
      carbonTonsCO2e: 16.97007845190733,
      waterKiloliters: 145.45317549934182,
      householdEnergyEquiv: 40.253996209232824,
      universitiesEquiv: 0.03667065378461725,
      olympicPoolsWater: 0.05818127019973673,
      gasolineCarEquiv: 3.689147489545072,
      atlanticFlightEquiv: 0.28283464086512217
    },
    
    hardware: {
      type: 'DGX H200/H100',
      host: 'AWS',
      gpuPowerDraw: 5.6,
      nonGpuPowerDraw: 4.6,
      pue: 1.14,
      wueSite: 0.18,
      wueSource: 3.142,
      carbonIntensityFactor: 0.385
    },
    
    performance: {
      medianTokensPerSecond: 316.3,
      medianFirstChunk: 0.54,
      queryLength: 'Short (300 tokens)'
    },
    
    pricing: '$0.002/1k tokens',
    sites: ['aws.amazon.com', 'bedrock.aws.com'],
    detectionPatterns: [
      /llama.*4.*maverick/i,
      /llama.*maverick/i,
      /meta.*llama.*4/i
    ],
    category: 'ultra-efficient'
  },

  'llama-3-3-70b': {
    name: 'Llama 3.3 70B',
    company: 'Meta',
    size: 'Medium',
    contextWindow: 128000,
    apiId: 'us.meta.llama3-3-70b-instruct-v1:0',
    aiIntelligenceIndex: 31.0,
    
    benchmarks: {
      longContextReasoning: 15,
      aime2024: 30,
      math500: 77,
      humanEval: 86
    },
    
    energy: {
      meanMax: 0.22213176741769938,
      meanMin: 0.1749831421161536,
      meanCombined: 0.1985574547669265,
      stdMax: 0.028942110408999678,
      stdMin: 0.02279899663930676,
      stdCombined: 0.035134999904643735
    },
    
    carbon: {
      meanMax: 0.08552073045581424,
      meanMin: 0.06736850971471912,
      meanCombined: 0.0764446200852667,
      stdMax: 0.011142712507464875,
      stdMin: 0.0087776137061331,
      stdCombined: 0.013526974963287839
    },
    
    water: {
      meanMax: 0.6979380132264114,
      meanMin: 0.5497970325289545,
      meanCombined: 0.6238675228776831,
      stdMax: 0.09093611090507697,
      stdMin: 0.07163444744070184,
      stdCombined: 0.11039416970039062
    },
    
    scaleImpact: {
      energyMWh: 198.5574547669265,
      carbonTonsCO2e: 76.4446200852667,
      waterKiloliters: 655.2186999461451,
      householdEnergyEquiv: 181.33100891956758,
      universitiesEquiv: 0.16518923025534651,
      olympicPoolsWater: 0.26208747997845805,
      gasolineCarEquiv: 16.618395670710154,
      atlanticFlightEquiv: 1.2740770014211118
    },
    
    hardware: {
      type: 'DGX H200/H100',
      host: 'AWS',
      gpuPowerDraw: 5.6,
      nonGpuPowerDraw: 4.6,
      pue: 1.14,
      wueSite: 0.18,
      wueSource: 3.142,
      carbonIntensityFactor: 0.385
    },
    
    performance: {
      medianTokensPerSecond: 247.2,
      medianFirstChunk: 0.45,
      queryLength: 'Short (300 tokens)'
    },
    
    pricing: '$0.004/1k tokens',
    sites: ['aws.amazon.com', 'bedrock.aws.com', 'meta.ai'],
    detectionPatterns: [
      /llama.*3\.3.*70b/i,
      /llama.*3\.3/i,
      /meta.*llama.*3\.3/i
    ],
    category: 'efficient-medium'
  },

  // Mistral AI Models
  'mistral-medium-3': {
    name: 'Mistral Medium 3',
    company: 'Mistral AI',
    size: 'Large',
    contextWindow: 131000,
    apiId: 'mistral-medium-2505',
    aiIntelligenceIndex: 39.0,
    
    benchmarks: {
      longContextReasoning: 28,
      aime2024: 44,
      math500: 91,
      humanEval: 90
    },
    
    energy: {
      meanMax: 1.8527325495330398,
      meanMin: 1.559437785508021,
      meanCombined: 1.70608516752053,
      stdMax: 0.7298384802566158,
      stdMin: 0.6143022120039782,
      stdCombined: 0.6903051224779202
    },
    
    carbon: {
      meanMax: 0.6536440434752564,
      meanMin: 0.5501696507272298,
      meanCombined: 0.601906847101243,
      stdMax: 0.25748701583453404,
      stdMin: 0.21672582039500352,
      stdCombined: 0.24353964721021026
    },
    
    water: {
      meanMax: 5.821285670632809,
      meanMin: 4.899753522066201,
      meanCombined: 5.360519596349506,
      stdMax: 2.2931525049662866,
      stdMin: 1.9301375501164995,
      stdCombined: 2.168938694825625
    },
    
    scaleImpact: {
      energyMWh: 1706.08516752053,
      carbonTonsCO2e: 601.906847101243,
      waterKiloliters: 5817.506694792506,
      householdEnergyEquiv: 1558.0686461374703,
      universitiesEquiv: 1.4193720195678285,
      olympicPoolsWater: 2.3270026779170023,
      gasolineCarEquiv: 130.84931458722676,
      atlanticFlightEquiv: 10.031780785020716
    },
    
    hardware: {
      type: 'DGX H200/H100',
      host: 'Azure',
      gpuPowerDraw: 5.6,
      nonGpuPowerDraw: 4.6,
      pue: 1.12,
      wueSite: 0.3,
      wueSource: 3.142,
      carbonIntensityFactor: 0.3528
    },
    
    performance: {
      medianTokensPerSecond: 48.2,
      medianFirstChunk: 0.32,
      queryLength: 'Short (300 tokens)'
    },
    
    pricing: '$0.012/1k tokens',
    sites: ['mistral.ai', 'chat.mistral.ai'],
    detectionPatterns: [
      /mistral.*medium.*3/i,
      /mistral.*medium/i,
      /mistral/i
    ],
    category: 'balanced-performance'
  },

  'mistral-large-2': {
    name: 'Mistral Large 2',
    company: 'Mistral AI',
    size: 'Large',
    contextWindow: 128000,
    apiId: 'Mistral-Large-2411',
    aiIntelligenceIndex: 29.0,
    
    benchmarks: {
      longContextReasoning: 5,
      aime2024: 11,
      math500: 74,
      humanEval: 90
    },
    
    energy: {
      meanMax: 1.9752948378068138,
      meanMin: 1.6625979871575367,
      meanCombined: 1.8189464124821753,
      stdMax: 0.2906642942282349,
      stdMin: 0.2446510066613624,
      stdCombined: 0.3108291389192815
    },
    
    carbon: {
      meanMax: 0.6968840187782438,
      meanMin: 0.586564569869179,
      meanCombined: 0.6417242943237115,
      stdMax: 0.10254636300372129,
      stdMin: 0.08631287515012864,
      stdCombined: 0.10966052021072252
    },
    
    water: {
      meanMax: 6.206376380389007,
      meanMin: 5.223882875648981,
      meanCombined: 5.715129628018993,
      stdMax: 0.9132672124651143,
      stdMin: 0.7686934629300006,
      stdCombined: 0.9766251544843824
    },
    
    scaleImpact: {
      energyMWh: 1818.9464124821752,
      carbonTonsCO2e: 641.7242943237114,
      waterKiloliters: 6202.34741707672,
      householdEnergyEquiv: 1661.1382762394294,
      universitiesEquiv: 1.5132665661249378,
      olympicPoolsWater: 2.480938966830688,
      gasolineCarEquiv: 139.50528137471989,
      atlanticFlightEquiv: 10.69540490539519
    },
    
    hardware: {
      type: 'DGX H200/H100',
      host: 'Azure',
      gpuPowerDraw: 5.6,
      nonGpuPowerDraw: 4.6,
      pue: 1.12,
      wueSite: 0.3,
      wueSource: 3.142,
      carbonIntensityFactor: 0.3528
    },
    
    performance: {
      medianTokensPerSecond: 34.5,
      medianFirstChunk: 0.39,
      queryLength: 'Short (300 tokens)'
    },
    
    pricing: '$0.018/1k tokens',
    sites: ['mistral.ai', 'chat.mistral.ai'],
    detectionPatterns: [
      /mistral.*large.*2/i,
      /mistral.*large/i,
      /mistral/i
    ],
    category: 'high-capability'
  }
};

/**
 * Enhanced site detection patterns with comprehensive model mapping
 */
const ENHANCED_AI_SITE_PATTERNS = {
  // OpenAI Platform
  openai: {
    domains: ['chat.openai.com', 'chatgpt.com', 'openai.com', 'platform.openai.com'],
    defaultModel: 'gpt-5-high',
    pathPatterns: [
      { pattern: /gpt-?5.*high/i, model: 'gpt-5-high' },
      { pattern: /gpt-?5.*medium/i, model: 'gpt-5-medium' },
      { pattern: /gpt-?5.*mini/i, model: 'gpt-5-mini' },
      { pattern: /gpt-?5/i, model: 'gpt-5-medium' },
      { pattern: /o3/i, model: 'o3' },
      { pattern: /o4.*mini/i, model: 'o4-mini-high' },
      { pattern: /gpt-4/i, model: 'gpt-5-medium' }
    ],
    performanceHints: {
      highLoad: 'gpt-5-high',
      balanced: 'gpt-5-medium',
      efficient: 'gpt-5-mini'
    }
  },

  // Anthropic Platform
  anthropic: {
    domains: ['claude.ai', 'anthropic.com'],
    defaultModel: 'claude-4-sonnet-thinking',
    pathPatterns: [
      { pattern: /claude.*4.*sonnet.*thinking/i, model: 'claude-4-sonnet-thinking' },
      { pattern: /claude.*4.*opus.*thinking/i, model: 'claude-4-opus-thinking' },
      { pattern: /claude.*4/i, model: 'claude-4-sonnet-thinking' },
      { pattern: /sonnet/i, model: 'claude-4-sonnet-thinking' },
      { pattern: /opus/i, model: 'claude-4-opus-thinking' }
    ],
    performanceHints: {
      reasoning: 'claude-4-sonnet-thinking',
      creative: 'claude-4-opus-thinking',
      balanced: 'claude-4-sonnet-thinking'
    }
  },

  // xAI Platform
  xai: {
    domains: ['grok.x.ai', 'x.ai'],
    defaultModel: 'grok-4',
    pathPatterns: [
      { pattern: /grok.*4/i, model: 'grok-4' },
      { pattern: /grok.*3.*mini.*reasoning/i, model: 'grok-3-mini-reasoning' },
      { pattern: /grok.*mini/i, model: 'grok-3-mini-reasoning' },
      { pattern: /grok/i, model: 'grok-4' }
    ],
    performanceHints: {
      highPerformance: 'grok-4',
      efficient: 'grok-3-mini-reasoning',
      reasoning: 'grok-3-mini-reasoning'
    }
  },

  // DeepSeek Platform
  deepseek: {
    domains: ['chat.deepseek.com', 'platform.deepseek.com', 'deepseek.com'],
    defaultModel: 'deepseek-v3',
    pathPatterns: [
      { pattern: /deepseek.*r1/i, model: 'deepseek-r1' },
      { pattern: /deepseek.*v3/i, model: 'deepseek-v3' },
      { pattern: /reasoning/i, model: 'deepseek-r1' },
      { pattern: /chat/i, model: 'deepseek-v3' }
    ],
    performanceHints: {
      reasoning: 'deepseek-r1',
      general: 'deepseek-v3',
      efficient: 'deepseek-v3'
    }
  },

  // Meta AI Platform
  meta: {
    domains: ['meta.ai', 'llama.meta.com'],
    defaultModel: 'llama-3-3-70b',
    pathPatterns: [
      { pattern: /llama.*4.*maverick/i, model: 'llama-4-maverick' },
      { pattern: /llama.*3\.3/i, model: 'llama-3-3-70b' },
      { pattern: /llama.*4/i, model: 'llama-4-maverick' },
      { pattern: /maverick/i, model: 'llama-4-maverick' }
    ],
    performanceHints: {
      ultraEfficient: 'llama-4-maverick',
      balanced: 'llama-3-3-70b',
      general: 'llama-3-3-70b'
    }
  },

  // AWS Bedrock
  aws: {
    domains: ['bedrock.aws.com', 'aws.amazon.com'],
    defaultModel: 'llama-3-3-70b',
    pathPatterns: [
      { pattern: /llama.*4.*maverick/i, model: 'llama-4-maverick' },
      { pattern: /llama.*3\.3/i, model: 'llama-3-3-70b' },
      { pattern: /meta.*llama/i, model: 'llama-3-3-70b' }
    ]
  },

  // Mistral AI Platform
  mistral: {
    domains: ['mistral.ai', 'chat.mistral.ai'],
    defaultModel: 'mistral-large-2',
    pathPatterns: [
      { pattern: /mistral.*large.*2/i, model: 'mistral-large-2' },
      { pattern: /mistral.*medium.*3/i, model: 'mistral-medium-3' },
      { pattern: /large/i, model: 'mistral-large-2' },
      { pattern: /medium/i, model: 'mistral-medium-3' }
    ],
    performanceHints: {
      highCapability: 'mistral-large-2',
      balanced: 'mistral-medium-3',
      general: 'mistral-medium-3'
    }
  },

  // Azure OpenAI Service
  azure: {
    domains: ['openai.azure.com', 'azure.microsoft.com'],
    defaultModel: 'gpt-5-medium',
    pathPatterns: [
      { pattern: /gpt-?5/i, model: 'gpt-5-medium' },
      { pattern: /gpt-4/i, model: 'gpt-5-medium' }
    ]
  }
};

/**
 * Enhanced AI Energy Manager with comprehensive model data and environmental impact
 */
class EnhancedAIEnergyManager {
  constructor() {
    this.detectedModels = new Map();
    this.sessionUsage = new Map();
    this.totalSessionEnergy = 0;
    this.totalSessionCarbon = 0;
    this.totalSessionWater = 0;
    this.lastDetectionTime = 0;
    this.modelUsageHistory = [];
    this.environmentalMetrics = {
      totalEnergyWh: 0,
      totalCarbongCO2e: 0,
      totalWaterML: 0,
      energyEquivalents: {
        households: 0,
        universities: 0,
        olympicPools: 0,
        gasolineCars: 0,
        atlanticFlights: 0
      }
    };
    
    // Initialize Enhanced Query Estimation Engine
    this.queryEstimationEngine = null;
    this.initializeQueryEstimation();
  }

  /**
   * Initialize the enhanced query estimation engine
   */
  initializeQueryEstimation() {
    try {
      // Check if EnhancedQueryEstimationEngine is available
      if (typeof EnhancedQueryEstimationEngine !== 'undefined') {
        this.queryEstimationEngine = new EnhancedQueryEstimationEngine(ENHANCED_AI_MODEL_DATABASE);
        console.log('[EnhancedAIEnergyManager] Enhanced query estimation engine initialized');
      } else {
        console.warn('[EnhancedAIEnergyManager] Enhanced query estimation engine not available, using fallback');
      }
    } catch (error) {
      console.error('[EnhancedAIEnergyManager] Failed to initialize query estimation engine:', error);
    }
  }

  /**
   * Detect AI model with enhanced accuracy and context awareness
   */
  detectAIModel(url, title = '', content = '', context = {}) {
    if (!url) return null;

    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.toLowerCase();
      const path = urlObj.pathname.toLowerCase();
      const fullUrl = url.toLowerCase();
      const searchParams = urlObj.searchParams;

      // Enhanced detection logic
      for (const [platform, config] of Object.entries(ENHANCED_AI_SITE_PATTERNS)) {
        if (this.matchesDomain(domain, config.domains)) {
          
          // Context-aware model selection
          let selectedModel = this.selectModelByContext(config, context);
          
          if (!selectedModel) {
            // Pattern-based detection
            for (const pathPattern of config.pathPatterns || []) {
              if (this.matchesPattern(pathPattern.pattern, [path, fullUrl, title])) {
                selectedModel = pathPattern.model;
                break;
              }
            }
          }

          // Use default if no specific model detected
          selectedModel = selectedModel || config.defaultModel;
          
          if (ENHANCED_AI_MODEL_DATABASE[selectedModel]) {
            const detection = {
              platform,
              modelKey: selectedModel,
              model: ENHANCED_AI_MODEL_DATABASE[selectedModel],
              confidence: this.calculateDetectionConfidence(platform, selectedModel, context),
              detectionMethod: selectedModel !== config.defaultModel ? 'pattern' : 'default',
              context: {
                ...context,
                url,
                domain,
                timestamp: Date.now()
              }
            };

            // Cache detection
            this.cacheDetection(url, detection);
            return detection;
          }
        }
      }

      // Fallback to individual model detection
      return this.detectByModelPatterns(url, title, content, context);
      
    } catch (error) {
      console.warn('[EnhancedAIEnergyManager] Error detecting AI model:', error);
      return null;
    }
  }

  /**
   * Select model based on performance context and user preferences
   */
  selectModelByContext(config, context) {
    if (!config.performanceHints || !context) return null;

    const { batteryLevel, performanceMode, userPreference } = context;
    
    // Battery-aware model selection
    if (batteryLevel !== undefined && batteryLevel < 0.3) {
      return config.performanceHints.efficient || config.performanceHints.ultraEfficient;
    }
    
    // Performance mode based selection
    if (performanceMode) {
      const hint = config.performanceHints[performanceMode];
      if (hint && ENHANCED_AI_MODEL_DATABASE[hint]) {
        return hint;
      }
    }
    
    // User preference based selection
    if (userPreference && config.performanceHints[userPreference]) {
      return config.performanceHints[userPreference];
    }
    
    return null;
  }

  /**
   * Enhanced usage estimation with environmental impact calculation
   */
  estimateAIUsage(tabData, detectedModel, context = {}) {
    if (!detectedModel || !tabData) {
      return { queries: 0, energy: 0, carbon: 0, water: 0, environmental: {} };
    }

    const { model } = detectedModel;
    const duration = tabData.duration || 0;
    const interactions = context.interactions || this.estimateInteractions(tabData, duration);
    
    // Enhanced query estimation using model characteristics
    const queryEstimation = this.calculateQueryEstimate(tabData, interactions, context, detectedModel);
    const estimatedQueries = typeof queryEstimation === 'object' ? queryEstimation.queries : queryEstimation;
    
    // Energy consumption calculation with uncertainty
    const energyStats = this.calculateEnergyWithUncertainty(model.energy, estimatedQueries);
    
    // Carbon footprint calculation
    const carbonStats = this.calculateCarbonWithUncertainty(model.carbon, estimatedQueries);
    
    // Water usage calculation
    const waterStats = this.calculateWaterWithUncertainty(model.water, estimatedQueries);
    
    // Environmental impact equivalents
    const environmental = this.calculateEnvironmentalImpact(model, estimatedQueries);
    
    const result = {
      queries: estimatedQueries,
      energy: energyStats,
      carbon: carbonStats,
      water: waterStats,
      environmental: environmental,
      model: {
        name: model.name,
        company: model.company,
        size: model.size,
        intelligence: model.aiIntelligenceIndex
      },
      confidence: detectedModel.confidence || 0.7
    };
    
    // Add enhanced query estimation metadata if available
    if (typeof queryEstimation === 'object' && queryEstimation.method) {
      result.queryEstimation = {
        confidence: queryEstimation.confidence,
        uncertainty: queryEstimation.uncertainty,
        method: queryEstimation.method,
        breakdown: queryEstimation.breakdown
      };
      
      // Use query estimation confidence to adjust overall confidence
      if (queryEstimation.confidence !== undefined) {
        result.confidence = (result.confidence + queryEstimation.confidence) / 2;
      }
    }
    
    return result;
  }

  /**
   * Calculate energy consumption with statistical uncertainty
   */
  calculateEnergyWithUncertainty(energyData, queries) {
    return {
      mean: energyData.meanCombined * queries,
      min: energyData.meanMin * queries,
      max: energyData.meanMax * queries,
      std: energyData.stdCombined * Math.sqrt(queries), // Scale std by sqrt(n)
      confidence95Lower: (energyData.meanCombined - 1.96 * energyData.stdCombined) * queries,
      confidence95Upper: (energyData.meanCombined + 1.96 * energyData.stdCombined) * queries
    };
  }

  /**
   * Calculate carbon emissions with statistical uncertainty
   */
  calculateCarbonWithUncertainty(carbonData, queries) {
    return {
      mean: carbonData.meanCombined * queries,
      min: carbonData.meanMin * queries,
      max: carbonData.meanMax * queries,
      std: carbonData.stdCombined * Math.sqrt(queries),
      confidence95Lower: (carbonData.meanCombined - 1.96 * carbonData.stdCombined) * queries,
      confidence95Upper: (carbonData.meanCombined + 1.96 * carbonData.stdCombined) * queries
    };
  }

  /**
   * Calculate water usage with statistical uncertainty
   */
  calculateWaterWithUncertainty(waterData, queries) {
    return {
      mean: waterData.meanCombined * queries,
      min: waterData.meanMin * queries,
      max: waterData.meanMax * queries,
      std: waterData.stdCombined * Math.sqrt(queries),
      confidence95Lower: (waterData.meanCombined - 1.96 * waterData.stdCombined) * queries,
      confidence95Upper: (waterData.meanCombined + 1.96 * waterData.stdCombined) * queries
    };
  }

  /**
   * Calculate environmental impact equivalents
   */
  calculateEnvironmentalImpact(model, queries) {
    const scaleImpact = model.scaleImpact;
    const scaleFactor = queries / 1000000000; // Scale from billion prompts to actual queries
    
    return {
      energyMWh: scaleImpact.energyMWh * scaleFactor,
      carbonTonsCO2e: scaleImpact.carbonTonsCO2e * scaleFactor,
      waterKiloliters: scaleImpact.waterKiloliters * scaleFactor,
      equivalents: {
        householdEnergyDays: scaleImpact.householdEnergyEquiv * scaleFactor,
        universitiesEnergy: scaleImpact.universitiesEquiv * scaleFactor,
        olympicPoolsWater: scaleImpact.olympicPoolsWater * scaleFactor,
        gasolineCarMiles: scaleImpact.gasolineCarEquiv * scaleFactor,
        atlanticFlights: scaleImpact.atlanticFlightEquiv * scaleFactor
      }
    };
  }

  /**
   * Enhanced query estimation using sophisticated multi-layered approach
   */
  calculateQueryEstimate(tabData, interactions, context, detectedModel) {
    // Use enhanced query estimation engine if available
    if (this.queryEstimationEngine && detectedModel) {
      try {
        const enhancedContext = {
          ...context,
          interactions,
          userActivity: this.calculateUserActivityLevel(tabData, context),
          performanceMode: context.performanceMode || 'balanced',
          isActiveTab: context.isActiveTab || false,
          userEngagement: context.userEngagement || 'medium'
        };
        
        const estimation = this.queryEstimationEngine.estimateQueries(tabData, detectedModel, enhancedContext);
        console.log('[EnhancedAIEnergyManager] Enhanced query estimation:', estimation);
        
        return {
          queries: estimation.queries,
          confidence: estimation.confidence,
          uncertainty: estimation.uncertainty,
          method: estimation.method,
          breakdown: estimation.breakdown
        };
      } catch (error) {
        console.warn('[EnhancedAIEnergyManager] Enhanced estimation failed, using fallback:', error);
      }
    }
    
    // Fallback to basic estimation
    return this.calculateBasicQueryEstimate(tabData, interactions, context);
  }

  /**
   * Fallback basic query estimation (original method)
   */
  calculateBasicQueryEstimate(tabData, interactions, context) {
    const duration = tabData.duration || 0;
    const baseQueries = Math.max(1, Math.floor(duration / 60000)); // Base: 1 query per minute
    
    // Interaction-based scaling
    let interactionMultiplier = 1.0;
    if (interactions) {
      interactionMultiplier = 1 + (interactions.clicks || 0) * 0.5 + (interactions.scrolls || 0) * 0.1;
    }
    
    // Context-based adjustments
    let contextMultiplier = 1.0;
    if (context.isActiveTab) contextMultiplier *= 1.5;
    if (context.userEngagement === 'high') contextMultiplier *= 2.0;
    if (context.userEngagement === 'low') contextMultiplier *= 0.5;
    
    const queries = Math.max(1, Math.floor(baseQueries * interactionMultiplier * contextMultiplier));
    
    return {
      queries,
      confidence: 0.6,
      uncertainty: 0.4,
      method: 'basic-fallback'
    };
  }

  /**
   * Calculate user activity level from available context
   */
  calculateUserActivityLevel(tabData, context) {
    let activityLevel = 0.5; // Default moderate activity
    
    // Duration-based activity
    const duration = tabData.duration || 0;
    const minutes = duration / 60000;
    if (minutes > 30) activityLevel += 0.2;
    if (minutes > 60) activityLevel += 0.1;
    
    // Context-based adjustments
    if (context.userEngagement === 'high') activityLevel += 0.3;
    if (context.userEngagement === 'low') activityLevel -= 0.2;
    if (context.isActiveTab) activityLevel += 0.2;
    
    // Battery level influence (users are less active on low battery)
    if (context.batteryLevel !== undefined) {
      if (context.batteryLevel < 0.3) activityLevel *= 0.7;
      else if (context.batteryLevel > 0.8) activityLevel *= 1.1;
    }
    
    return Math.max(0.1, Math.min(1.0, activityLevel));
  }

  /**
   * Estimate user interactions from tab data
   */
  estimateInteractions(tabData, duration) {
    if (!duration) return { clicks: 0, scrolls: 0 };
    
    // Simple heuristic based on duration
    const minutes = duration / 60000;
    return {
      clicks: Math.floor(minutes * 2), // ~2 clicks per minute
      scrolls: Math.floor(minutes * 5)  // ~5 scrolls per minute
    };
  }

  /**
   * Check if domain matches any of the target domains
   */
  matchesDomain(domain, targetDomains) {
    return targetDomains.some(target =>
      domain === target || domain.endsWith('.' + target)
    );
  }

  /**
   * Check if pattern matches any of the test strings
   */
  matchesPattern(pattern, testStrings) {
    return testStrings.some(str => pattern.test(str || ''));
  }

  /**
   * Calculate detection confidence based on various factors
   */
  calculateDetectionConfidence(platform, modelKey, context) {
    let confidence = 0.7; // Base confidence
    
    // Platform-specific confidence boost
    if (platform) confidence += 0.1;
    
    // Model-specific patterns detected
    if (context.url && context.url.includes(modelKey)) confidence += 0.1;
    
    // Additional context indicators
    if (context.userAgent && context.userAgent.includes('Chrome')) confidence += 0.05;
    if (context.timestamp) confidence += 0.05;
    
    return Math.min(1.0, confidence);
  }

  /**
   * Cache detection result for performance
   */
  cacheDetection(url, detection) {
    const cacheKey = new URL(url).hostname;
    this.detectedModels.set(cacheKey, {
      ...detection,
      timestamp: Date.now()
    });
    
    // Clean old cache entries (older than 5 minutes)
    const now = Date.now();
    for (const [key, cached] of this.detectedModels.entries()) {
      if (now - cached.timestamp > 300000) {
        this.detectedModels.delete(key);
      }
    }
  }

  /**
   * Fallback detection using individual model patterns
   */
  detectByModelPatterns(url, title, content, context) {
    const urlLower = url.toLowerCase();
    const titleLower = (title || '').toLowerCase();
    const contentLower = (content || '').toLowerCase();
    
    // Search through all models for pattern matches
    for (const [modelKey, model] of Object.entries(ENHANCED_AI_MODEL_DATABASE)) {
      if (model.detectionPatterns) {
        for (const pattern of model.detectionPatterns) {
          if (pattern.test(urlLower) || pattern.test(titleLower) || pattern.test(contentLower)) {
            return {
              platform: 'detected',
              modelKey,
              model,
              confidence: 0.6,
              detectionMethod: 'pattern-fallback',
              context: {
                ...context,
                url,
                timestamp: Date.now()
              }
            };
          }
        }
      }
    }
    
    return null;
  }

  /**
   * Update session totals with new usage data
   */
  updateSessionTotals(usageData) {
    if (!usageData) return;
    
    this.totalSessionEnergy += usageData.energy?.mean || 0;
    this.totalSessionCarbon += usageData.carbon?.mean || 0;
    this.totalSessionWater += usageData.water?.mean || 0;
    
    // Update environmental metrics
    this.environmentalMetrics.totalEnergyWh += usageData.energy?.mean || 0;
    this.environmentalMetrics.totalCarbongCO2e += usageData.carbon?.mean || 0;
    this.environmentalMetrics.totalWaterML += usageData.water?.mean || 0;
    
    if (usageData.environmental?.equivalents) {
      const eq = this.environmentalMetrics.energyEquivalents;
      const newEq = usageData.environmental.equivalents;
      eq.households += newEq.householdEnergyDays || 0;
      eq.universities += newEq.universitiesEnergy || 0;
      eq.olympicPools += newEq.olympicPoolsWater || 0;
      eq.gasolineCars += newEq.gasolineCarMiles || 0;
      eq.atlanticFlights += newEq.atlanticFlights || 0;
    }
    
    // Add to usage history
    this.modelUsageHistory.push({
      timestamp: Date.now(),
      model: usageData.model,
      usage: usageData,
      sessionTotals: {
        energy: this.totalSessionEnergy,
        carbon: this.totalSessionCarbon,
        water: this.totalSessionWater
      }
    });
    
    // Keep history limited to last 100 entries
    if (this.modelUsageHistory.length > 100) {
      this.modelUsageHistory = this.modelUsageHistory.slice(-100);
    }
  }

  /**
   * Get comprehensive session statistics
   */
  getSessionStats() {
    return {
      totals: {
        energy: this.totalSessionEnergy,
        carbon: this.totalSessionCarbon,
        water: this.totalSessionWater
      },
      environmental: this.environmentalMetrics,
      modelsUsed: Array.from(this.sessionUsage.keys()),
      historyCount: this.modelUsageHistory.length,
      lastUpdate: this.modelUsageHistory.length > 0 ?
        this.modelUsageHistory[this.modelUsageHistory.length - 1].timestamp : null
    };
  }

  /**
   * Compare models by environmental impact
   */
  compareModels(modelKeys) {
    const comparisons = [];
    
    for (const key of modelKeys) {
      const model = ENHANCED_AI_MODEL_DATABASE[key];
      if (model) {
        comparisons.push({
          key,
          name: model.name,
          company: model.company,
          category: model.category,
          intelligence: model.aiIntelligenceIndex,
          energy: model.energy.meanCombined,
          carbon: model.carbon.meanCombined,
          water: model.water.meanCombined,
          pricing: model.pricing,
          efficiency: this.calculateEfficiencyScore(model)
        });
      }
    }
    
    return comparisons.sort((a, b) => b.efficiency - a.efficiency);
  }

  /**
   * Calculate efficiency score (intelligence per unit energy)
   */
  calculateEfficiencyScore(model) {
    const intelligence = model.aiIntelligenceIndex || 1;
    const energy = model.energy.meanCombined || 1;
    return intelligence / energy;
  }

  /**
   * Get model recommendations based on user context
   */
  getModelRecommendations(context = {}) {
    const { useCase, batteryLevel, performancePreference } = context;
    const models = Object.entries(ENHANCED_AI_MODEL_DATABASE);
    
    let recommendations = models.map(([key, model]) => ({
      key,
      model,
      score: this.calculateRecommendationScore(model, context)
    }));
    
    // Sort by score and return top 5
    recommendations.sort((a, b) => b.score - a.score);
    return recommendations.slice(0, 5).map(r => ({
      key: r.key,
      name: r.model.name,
      company: r.model.company,
      category: r.model.category,
      score: r.score,
      reason: this.getRecommendationReason(r.model, context)
    }));
  }

  /**
   * Calculate recommendation score for a model
   */
  calculateRecommendationScore(model, context) {
    let score = model.aiIntelligenceIndex || 50;
    
    // Battery level considerations
    if (context.batteryLevel !== undefined) {
      const energyPenalty = model.energy.meanCombined * (1 - context.batteryLevel);
      score -= energyPenalty;
    }
    
    // Performance preference
    if (context.performancePreference === 'efficiency') {
      score += this.calculateEfficiencyScore(model) * 10;
    } else if (context.performancePreference === 'performance') {
      score += model.aiIntelligenceIndex * 0.5;
    }
    
    // Use case specific scoring
    if (context.useCase === 'reasoning' && model.category.includes('reasoning')) {
      score += 20;
    } else if (context.useCase === 'creative' && model.category.includes('creative')) {
      score += 20;
    }
    
    return score;
  }

  /**
   * Get human-readable recommendation reason
   */
  getRecommendationReason(model, context) {
    const reasons = [];
    
    if (model.category.includes('efficient')) {
      reasons.push('energy efficient');
    }
    if (model.aiIntelligenceIndex > 60) {
      reasons.push('high intelligence');
    }
    if (model.category.includes('reasoning')) {
      reasons.push('excellent reasoning');
    }
    if (model.energy.meanCombined < 1.0) {
      reasons.push('low energy consumption');
    }
    
    return reasons.join(', ') || 'balanced performance';
  }

  /**
   * Convert energy consumption (Wh) to power consumption (W) based on duration
   * Used by the enhanced query estimation engine
   */
  convertEnergyToWatts(energyStats, durationMs) {
    if (!energyStats || !durationMs || durationMs === 0) return 0;
    
    const durationHours = durationMs / 3600000; // Convert ms to hours
    const energyWh = typeof energyStats === 'object' ? energyStats.mean : energyStats;
    
    return energyWh / durationHours; // Watts = Wh / hours
  }

  /**
   * Enhanced cleanup with query estimation engine cleanup
   */
  cleanup() {
    try {
      // Clean old cached detections (older than 5 minutes)
      const now = Date.now();
      for (const [key, cached] of this.detectedModels.entries()) {
        if (now - cached.timestamp > 300000) {
          this.detectedModels.delete(key);
        }
      }
      
      // Clean old usage history (keep last 50 entries)
      if (this.modelUsageHistory.length > 50) {
        this.modelUsageHistory = this.modelUsageHistory.slice(-50);
      }
      
      // Query estimation engine cleanup
      if (this.queryEstimationEngine && typeof this.queryEstimationEngine.cleanup === 'function') {
        this.queryEstimationEngine.cleanup();
      }
      
      console.log('[EnhancedAIEnergyManager] Cleanup completed');
    } catch (error) {
      console.warn('[EnhancedAIEnergyManager] Cleanup failed:', error);
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ENHANCED_AI_MODEL_DATABASE,
    ENHANCED_AI_SITE_PATTERNS,
    EnhancedAIEnergyManager
  };
} else if (typeof window !== 'undefined') {
  window.ENHANCED_AI_MODEL_DATABASE = ENHANCED_AI_MODEL_DATABASE;
  window.ENHANCED_AI_SITE_PATTERNS = ENHANCED_AI_SITE_PATTERNS;
  window.EnhancedAIEnergyManager = EnhancedAIEnergyManager;
}