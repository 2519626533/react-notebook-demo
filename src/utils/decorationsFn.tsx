import type { CodeBlockElement } from '@/types/slate'
import Prism from 'prismjs'
import { Editor, Element, Node, type NodeEntry, type Range } from 'slate'
import { useSlateStatic } from 'slate-react'
import { normalizeTokens } from './normalize-Tokens'

// 合并map函数
const mergeMaps = <K, V>(...maps: Map<K, V>[]) => {
  const map = new Map<K, V>()
  for (const m of maps) {
    for (const item of m) {
      map.set(...item)
    }
  }
  return map
}

const codeBlockDecorationCache = new WeakMap
<Element, { text: string, nodeToDecorations: Map<Element, Range[]> }>()

// 获取孩子节点装饰范围
const getChildNodeToDecorations = ([
  block,
  blockPath,
]: NodeEntry<CodeBlockElement>) => {
  const text = block.children.map(line => Node.string(line)).join('\n')

  const cached = codeBlockDecorationCache.get(block)

  if (cached && cached.text === text) {
    return cached.nodeToDecorations
  }

  const nodeToDecorations = new Map<Element, Range[]>()

  const language = block.language || 'plaintext'
  const tokens = Prism.tokenize(text, Prism.languages[language])

  const normalizedTokens = normalizeTokens(tokens)
  const blockChildren = block.children as Element[]

  for (let index = 0; index < normalizedTokens.length; index++) {
    const tokens = normalizedTokens[index]
    const element = blockChildren[index]

    if (!nodeToDecorations.has(element)) {
      nodeToDecorations.set(element, [])
    }

    let start = 0
    for (const token of tokens) {
      const length = token.content.length
      if (!length) {
        continue
      }

      const end = start + length

      const path = [...blockPath, index, 0]
      const range = {
        anchor: { path, offset: start },
        focus: { path, offset: end },
        token: true,
        ...Object.fromEntries(token.types.map(type => [type, true])),
      }
      nodeToDecorations.get(element)!.push(range)

      start = end
    }
  }
  codeBlockDecorationCache.set(block, { text, nodeToDecorations })
  return nodeToDecorations
}

// 设置节点生成装饰范围
const SetNodeToDecorations = () => {
  const editor = useSlateStatic()
  const blockEntries = Array.from(
    Editor.nodes(editor, {
      at: [],
      mode: 'highest',
      match: n => Element.isElement(n) && n.type === 'code-block' && 'language' in n,
    }),
  )

  const nodeToDecorations = mergeMaps(
    ...blockEntries.map(getChildNodeToDecorations),
  )

  editor.nodeToDecorations = nodeToDecorations
  return null
}

export {
  SetNodeToDecorations,
}
