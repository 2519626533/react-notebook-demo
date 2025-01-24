import type { CodeBlockElement } from '@/types/slate'
import Prism from 'prismjs'
import { Editor, Element, Node, type NodeEntry, type Range } from 'slate'
import { useSlate, useSlateStatic } from 'slate-react'
import { CodeBlockType } from './editorFunctions'
import { normalizeTokens } from './normalize-Tokens'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-tsx'
import 'prismjs/components/prism-markdown'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-php'
import 'prismjs/components/prism-sql'
import 'prismjs/components/prism-java'

// 合并map函数
const mergeMaps = <K, V>(...maps: Map<K, V>[]) => {
  const map = new Map<K, V>()

  for (const m of maps) {
    for (const [key, value] of m) {
      if (!map.has(key)) {
        map.set(key, [...value])
      } else {
        map.get(key)!.push(...value)
      }
    }
  }

  return map
}

// 获取孩子节点装饰范围
const getChildNodeToDecorations = ([
  block,
  blockPath,
]: NodeEntry<CodeBlockElement>) => {
  const nodeToDecorations = new Map<Element, Range[]>()

  const text = block.children.map(line => Node.string(line)).join('\n')
  const language = block.language || 'plaintext'
  const tokens = Prism.tokenize(text, Prism.languages[language])
  console.log(tokens)
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
  return nodeToDecorations
}

// 设置节点生成装饰范围
const SetNodeToDecorations = () => {
  const editor = useSlateStatic()
  const blockEntries = Array.from(
    Editor.nodes(editor, {
      at: [],
      mode: 'highest',
      match: n => Element.isElement(n) && n.type === CodeBlockType,
    }),
  )

  const nodeToDecorations = mergeMaps(
    ...blockEntries.map(getChildNodeToDecorations),
  )

  editor.nodeToDecorations = nodeToDecorations
  console.log('nodeToDecorations:', nodeToDecorations)
  return null
}

export {
  SetNodeToDecorations,
}
