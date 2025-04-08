import type { CustomEditor, TextAlginType } from '@/types/slate'
import type { RenderElementProps, RenderLeafProps } from 'slate-react'
import { BLOCK_HOTKEYS, CODEBLOCK_HOTKEY, MARK_HOTKEYS, TextDecorationList } from '@/types/components'
import { Leaf, MyElement } from '@/utils/editorElement'
import isHotkey from 'is-hotkey'
import { type DependencyList, useCallback, useEffect, useRef, useState } from 'react'
import { type Descendant, Editor, Element, type NodeEntry, type Range } from 'slate'
import { depsAreSame, observer } from './editor-helps'
import { isBlockActive, TEXT_ALGIN_TYPES, toggleBlock, toggleCodeBlock, toggleMark } from './editorFunctions'
// ------------------------------------------------------------------------------------------------------------------------------------
/*
    Hooks函数
*/
// 块级元素渲染
const useRenderElement = (
  flattedArr: Descendant[],
  visibleRange: number[],
  updatePosition: (index: number, height: number) => void,
) => {
  const pathCache = useRef(new WeakMap<Element, number>())

  const getElementIndex = useCallback((element: Element): number => {
    const cachedIndex = pathCache.current.get(element)
    if (cachedIndex !== undefined) {
      return cachedIndex
    }
    const index = flattedArr[element.lineNumber - 1]
      ? element.lineNumber - 1
      : -1
    pathCache.current.set(element, index)
    return index
  }, [flattedArr])

  return useCallback((props: RenderElementProps) => {
    const element = props.element
    const [start, end] = visibleRange
    // 获取元素在editor中的index
    const index = getElementIndex(element)

    const ref = (node: HTMLDivElement | null) => {
      if (node) {
        updatePosition(index, node.clientHeight)
      }
    }

    if (
      index === -1
      && element.startIndex <= end
      && element.endIndex >= start
    ) {
      return <MyElement {...props} />
    }

    return (index >= start && index <= end)
      ? <MyElement {...props} ref={ref} />
      : null
  }, [visibleRange, getElementIndex, updatePosition])
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
    // 高亮代码块
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

// useCreation fn:state不会跟着其他state改变而发生改变，可以获取最新的state
const useCreation = <T,>(fn: () => T, deps: DependencyList) => {
  const { current } = useRef({
    deps,
    obj: undefined as undefined | T,
    initialized: false,
  })

  if (current.initialized === false || !depsAreSame(current.deps, deps)) {
    current.deps = deps
    current.obj = fn()
    current.initialized = true
  }

  return current.obj as T
}

// useUpdate fn:强制更新state
const useUpdate = () => {
  const [,setState] = useState({})
  return useCallback(() => setState({}), [])
}

// useReactive fn:将state变为响应式，可直接通过state.xxx获取最新数据
const useReactive = <T extends Record<string, any>>(initialState: T): T => {
  const ref = useRef<T>(initialState)
  const update = useUpdate()

  const state = useCreation(() => {
    return observer(ref.current, () => {
      update()
    })
  }, [])

  return state
}

// useEventListener fn:添加事件监听，在组件卸载时自动销毁监听
const useEventListener = (event: string, handler: (...e: any) => void, target: any = window) => {
  useEffect(() => {
    const targetElement = 'current' in target ? target.current : window
    const useEventListener = (event: Event) => {
      return handler(event)
    }
    targetElement.addEventListener(event, useEventListener)
    return () => {
      targetElement.removeEventListener(event, useEventListener)
    }
  }, [event, handler, target])
}

export {
  useCreation,
  useDecorate,
  useEventListener,
  useInterval,
  useOnKeyDown,
  useReactive,
  useRenderElement,
  useRenderLeaf,
  useUpdate,
}
