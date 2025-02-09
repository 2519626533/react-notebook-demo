import type { CustomEditor, TextAlginType } from '@/types/slate'
import type { RenderElementProps, RenderLeafProps } from 'slate-react'
import { BLOCK_HOTKEYS, CODEBLOCK_HOTKEY, MARK_HOTKEYS, TextDecorationList } from '@/types/components'
import { Leaf, MyElement } from '@/utils/editorElement'
import isHotkey from 'is-hotkey'
import { useCallback } from 'react'
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
    if (Element.isElement(node) && TextDecorationList.includes(node.type as string)) {
      let childPath: number[] = path

      node.children.map((child, childIndex) => {
        if (node.type === 'list-item') {
          childPath = [...path, childIndex]
        }
        // console.log(child, childPath)
        const urlRegex = /https?:\/\/[^\s)]+|(?<=\]\()[^)]+/
        const urlMatch = urlRegex.exec(child.text)
        if (urlMatch) {
          ranges.push({
            anchor: { path: childPath, offset: urlMatch.index },
            focus: { path: childPath, offset: urlMatch.index + urlMatch[0].length },
            url: true,
          })
        }
        const mdLinkTextRegex = /\[[^\]]+\]/
        const mdLinkMatch = mdLinkTextRegex.exec(child.text)
        if (mdLinkMatch) {
          ranges.push({
            anchor: { path: childPath, offset: mdLinkMatch.index },
            focus: { path: childPath, offset: mdLinkMatch.index + mdLinkMatch[0].length },
            mdLink: true,
          })
        }
        const uuidRegex = /\{\{[a-f0-9-]+\}\}/
        const uuidMatch = uuidRegex.exec(child.text)
        if (uuidMatch) {
          ranges.push({
            anchor: { path: childPath, offset: uuidMatch.index },
            focus: { path: childPath, offset: uuidMatch.index + uuidMatch[0].length },
            uuid: true,
          })
        }
        return null
      })
    }
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

export {
  useDecorate,
  useOnKeyDown,
  useRenderElement,
  useRenderLeaf,
}
