import type { CustomEditor, TextAlginType } from '@/types/slate'
import type { RenderElementProps, RenderLeafProps } from 'slate-react'
import { BLOCK_HOTKEYS, CODEBLOCK_HOTKEY, MARK_HOTKEYS, TextDecorationList } from '@/types/components'
import { Leaf, MyElement } from '@/utils/editorElement'
import isHotkey from 'is-hotkey'
import { useCallback, useEffect, useRef } from 'react'
import { Editor, Element, type NodeEntry, type Range } from 'slate'
import { isBlockActive, TEXT_ALGIN_TYPES, toggleBlock, toggleCodeBlock, toggleMark } from './editorFunctions'
// ------------------------------------------------------------------------------------------------------------------------------------
/*
    Hooks函数
*/
// 块级元素渲染
const useRenderElement = () => {
  return useCallback((props: RenderElementProps) => {
    return (
      <MyElement {...props}>
      </MyElement>
    )
  }, [])
}

// 字符级格式渲染
const useRenderLeaf = () => {
  return useCallback((props: RenderLeafProps) => {
    return <Leaf {...props}></Leaf>
  }, [])
}

// 装饰格式函数
const useDecorate = (editor: CustomEditor) => {
  return useCallback((nodeEntry: NodeEntry) => {
    const [node, path] = nodeEntry
    const ranges: Range[] = []
    if (Element.isElement(node) && node.type === 'code-block') {
      for (const child of node.children) {
        if (Element.isElement(child) && child.type === 'code-line') {
          const childRanges = editor.nodeToDecorations?.get(child) || []
          ranges.push(...childRanges)
        }
      }
    }
    // 高亮网址、uuid、mdLink
    if (Element.isElement(node) && TextDecorationList.includes(node.type as string)) {
      node.children.forEach((child, childIndex) => {
        const childPath = node.type === 'list-item' ? [...path, childIndex] : path
        const text = child.text

        const patterns: { regex: RegExp, props: string }[] = [
          { regex: /https?:\/\/[^\s)]+|(?<=\]\()[^)]+/, props: 'url' },
          { regex: /\[[^\]]+\]/, props: 'mdLink' },
          { regex: /\{\{[a-f0-9-]+\}\}/, props: 'uuid' },
        ]

        patterns.forEach(({ regex, props }) => {
          const match = regex.exec(text)
          if ((match)) {
            ranges.push({
              anchor: { path: childPath, offset: match.index },
              focus: { path: childPath, offset: match.index + match[0].length },
              [props]: true,
            })
          }
        })
      })
    }
    // console.log(ranges)
    return ranges
  }, [editor.nodeToDecorations])
}
// 处理指令函数
const useOnKeyDown = (editor: CustomEditor) => {
  return useCallback((e: React.KeyboardEvent) => {
    if (isHotkey('tab', e)) {
      e.preventDefault()
      Editor.insertText(editor, '    ')
    }
    // 切换mark快捷键
    for (const hotkey in MARK_HOTKEYS) {
      if (isHotkey(hotkey, e)) {
        e.preventDefault()
        const mark = MARK_HOTKEYS[hotkey]
        toggleMark(editor, mark)
      }
    }
    // 切换block快捷键
    for (const hotkey in BLOCK_HOTKEYS) {
      if (isHotkey(hotkey, e)) {
        e.preventDefault()
        const block = BLOCK_HOTKEYS[hotkey]
        toggleBlock(editor, block)
      }
    }
    // 切换codeblock快捷键
    for (const hotkey in CODEBLOCK_HOTKEY) {
      if (isHotkey(hotkey, e)) {
        e.preventDefault()
        const codeblock = CODEBLOCK_HOTKEY[hotkey]
        const isActive = isBlockActive(
          editor,
          codeblock,
          TEXT_ALGIN_TYPES.includes(codeblock as TextAlginType) ? 'align' : 'type',
        )
        toggleCodeBlock(editor, isActive)
      }
    }
  }, [editor])
}

// 自定义定时器
const noop = () => {}
const useInterval = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef(noop)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    const tick = () => savedCallback.current()

    if (delay) {
      const id = setInterval(tick, delay)

      return () => clearInterval(id)
    }
  }, [delay])
}

export {
  useDecorate,
  useInterval,
  useOnKeyDown,
  useRenderElement,
  useRenderLeaf,
}
