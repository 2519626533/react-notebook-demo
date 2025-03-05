import type { AutoHighlightResult, HLJSApi } from 'highlight.js'
import hljs from 'highlight.js/lib/core'
import css from 'highlight.js/lib/languages/css'
import java from 'highlight.js/lib/languages/java'
import javascript from 'highlight.js/lib/languages/javascript'
import markdown from 'highlight.js/lib/languages/markdown'
import php from 'highlight.js/lib/languages/php'
import python from 'highlight.js/lib/languages/python'
import sql from 'highlight.js/lib/languages/sql'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('css', css)
hljs.registerLanguage('java', java)
hljs.registerLanguage('markdown', markdown)
hljs.registerLanguage('php', php)
hljs.registerLanguage('python', python)
hljs.registerLanguage('sql', sql)

const registerJsx = (hljs: HLJSApi) => {
  const jsLanguage = hljs.getLanguage('javascript') || javascript(hljs)
  return {
    ...jsLanguage,
    name: 'JSX',
    contains: [
      ...jsLanguage.contains,
      {
        className: 'xml-tag',
        begin: /<[\w\-]+/,
        end: /\/?>/,
        contains: [
          {
            className: 'name',
            begin: /[\w\-]+/,
            relevance: 0,
          },
        ],
      },
    ],
  }
}

const registerTsx = (hljs: HLJSApi) => {
  const tsLanguage = hljs.getLanguage('typescript') || typescript(hljs)
  return {
    ...tsLanguage,
    name: 'TSX',
    contains: [
      ...tsLanguage.contains,
      {
        className: 'xml-tag',
        begin: /<[\w\-]+/,
        end: /\/?>/,
        contains: [
          {
            className: 'name',
            begin: /[\w\-]+/,
            relevance: 0,
          },
        ],
      },
    ],
  }
}
hljs.registerLanguage('jsx', registerJsx)
hljs.registerLanguage('tsx', registerTsx)

interface DetectionResult {
  language: string
  confidence: number
}

// 关键特征快速检测
const detectByExplicitPatterns = (code: string): DetectionResult | null => {
  // Java特征检测
  if (/(?:public|private)\s+class\s+\w+/.test(code)
    && /public\s+static\s+void\s+main\s*\(/.test(code)) {
    return {
      language: 'java',
      confidence: 1,
    }
  }
  // python特征检测
  if (/^def\s+\w+\s*\(.*\)\s*:/.test(code)
    || /print\(['"]/.test(code)
    || /:\s*$/.test(code)) {
    return {
      language: 'python',
      confidence: 1,
    }
  }

  // React 特征检测
  const reactPatterns = [
    /\buseState\(/,
    /\buseEffect\(/,
    /React\.FC/,
    /\.tsx['"]/,
  ]
  const hasReactHooks = reactPatterns.some(p => p.test(code))
  const hasCapitalizedTags = /<[A-Z]\w+/.test(code)

  if (hasReactHooks || hasCapitalizedTags) {
    const isTypeScript = /:\s*React\.FC</.test(code) || /\.tsx['"]/.test(code)
    return {
      language: isTypeScript ? 'tsx' : 'jsx',
      confidence: 1,
    }
  }

  // CSS误判排除
  if (!/(?:\.|#)[\w-]+\s*\{/.test(code)
    && !/:\s*[\w-]+;/.test(code)) {
    return null
  }
  return null
}

// 置信度增强处理
const enhanceConfidence = (code: string, hlResult: AutoHighlightResult): DetectionResult => {
  let detectedLang = hlResult.language || 'plaintext'
  let confidence = Math.min(hlResult.relevance / 100, 1)

  // Java置信度增强
  if (detectedLang === 'java' || detectedLang === 'typescript') {
    const javaKeywords = ['public class', 'static void', 'throws']
    const tsKeywords = ['type', 'interface', 'declare']

    const javaScore = javaKeywords.filter(kw => code.includes(kw)).length
    const tsScore = tsKeywords.filter(kw => code.includes(kw)).length

    if (javaScore > tsScore) {
      detectedLang = 'java'
      confidence = Math.min(confidence + javaScore * 0.3, 1)
    }
  }

  // Python置信度增强
  if (detectedLang === 'python' || detectedLang === 'css') {
    const pyPatterns = [
      /^def\s/,
      /^class\s/,
      /:\s*$/,
      /print\(/,
      /import\s+(?:os|sys|math)\b/,
    ]
    const pyMatches = pyPatterns.filter(p => p.test(code)).length

    if (pyMatches > 1) {
      detectedLang = 'python'
      confidence = Math.min(confidence + pyMatches * 0.2, 1)
    }
  }

  // React/JSX 增强检测
  const reactFeatures = [
    /\buseState\(/,
    /\buseEffect\(/,
    /=>\s*\{/,
    /<\/?[A-Z]\w+/,
  ]
  const reactFeatureCount = reactFeatures.filter(p => p.test(code)).length

  if (reactFeatureCount > 0) {
    const isTSX = /:\s*React\.FC</.test(code) || /\.tsx['"]/.test(code)
    detectedLang = isTSX ? 'tsx' : 'jsx'
    confidence = Math.min(confidence + reactFeatureCount * 0.3, 1)
  }

  return {
    language: detectedLang,
    confidence: Number(confidence.toFixed(2)),
  }
}

export const detectLanguage = (code: string): DetectionResult => {
  const cleanedCode = code.trim()

  const forcedLang = detectByExplicitPatterns(cleanedCode)
  if (forcedLang)
    return forcedLang

  const hlResult = hljs.highlightAuto(code, [
    'javascript',
    'typescript',
    'jsx',
    'tsx',
    'html',
    'css',
    'java',
    'markdown',
    'php',
    'python',
    'sql',
  ])

  return enhanceConfidence(cleanedCode, hlResult)
}
