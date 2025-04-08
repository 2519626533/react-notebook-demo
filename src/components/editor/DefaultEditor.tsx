import type { NoteProps } from '@/types/layout'
import type { CustomEditor, CustomElement } from '@/types/slate'
import type { Descendant, Operation, Path } from 'slate'
import { updateNote } from '@/store/note'
import { getNoteState, getSettings } from '@/store/selector'
import { BlockType, emptyElement, type IVisibleState, type VSPosition } from '@/types/components'
import { emptyNote, type noteItem } from '@/types/slice'
import { SetNodeToDecorations } from '@/utils/decorationsFn'
import { binarySearch, flatArr, positionInit } from '@/utils/editor-helps'
import { useDecorate, useEventListener, useOnKeyDown, useReactive, useRenderElement, useRenderLeaf } from '@/utils/Hooks'
import { getActiveNote, getScratchpad } from '@/utils/notes-helps'
import dayjs from 'dayjs'
import _ from 'lodash'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { createEditor, Editor, Element, Node, Transforms } from 'slate'
import { withHistory } from 'slate-history'
import { Editable, Slate, withReact } from 'slate-react'
import ToolBar from '../toolbar/ToolBar'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-tsx'
import 'prismjs/components/prism-markdown'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-php'
import 'prismjs/components/prism-sql'
import 'prismjs/components/prism-java'

// EditArea主体
const DefaultEditor: React.FC<NoteProps> = ({ isScratchpad }) => {
  const editRef = useRef<HTMLDivElement>(null)
  const { notes, activeNoteId } = useSelector(getNoteState, shallowEqual)
  const dispatch = useDispatch()

  // 创建Slate
  const editor = useMemo(() => {
    const editor = withHistory(withReact(createEditor()))
    editor.nodeToDecorations = new Map()
    return editor
  }, [])

  // 初始化数据
  const activeNote = useMemo(() => {
    if (isScratchpad) {
      return getScratchpad(notes)
    } else {
      const note = getActiveNote(notes, activeNoteId)
      if (note && (!note.content || note?.content.length === 0)) {
        note.content = [emptyElement]
      }
      return note
    }
  }, [notes, activeNoteId, isScratchpad])

  const value = useMemo(() => {
    return activeNote ? activeNote.content : [emptyElement]
  }, [activeNote])

  // 虚拟滚动
  const containerRef = useRef<HTMLDivElement>(null) // 容器ref
  const slateRef = useRef<HTMLDivElement>(null)
  const visibleState: IVisibleState = useReactive({
    scrollAllHeight: '100%', // 容器初始高度
    listHeight: 0, // 行总高度
    initItemHeight: 30, // 初始行高
    renderCount: 0, // 渲染个数
    bufferCount: 40, // 缓冲区个数
    start: 0, // 开始索引
    end: 0, // 终止索引
    currentOffset: 0, // 偏移量
  })

  let flattedArr = flatArr(value)
  const [positions, setPosition] = useState<VSPosition[]>(() =>
    positionInit(flattedArr, visibleState.initItemHeight))

  useEffect(() => {

  }, [value, visibleState.initItemHeight])

  // visibleState初始化
  useEffect(() => {
    if (!containerRef.current)
      return
    const scrollAllHeight = containerRef.current.offsetHeight

    const listHeight = positions[positions.length - 1].bottom

    const renderCount = Math.ceil(
      scrollAllHeight / visibleState.initItemHeight,
    ) + visibleState.bufferCount

    visibleState.renderCount = renderCount
    visibleState.end = renderCount + 1
    visibleState.listHeight = listHeight
  }, [containerRef, positions])

  useEventListener('scroll', _.throttle(() => {
    if (!slateRef.current) {
      return
    }
    const { scrollTop } = slateRef.current
    // console.log(positions)
    visibleState.listHeight = positions[positions.length - 1].bottom
    visibleState.start = binarySearch(positions, scrollTop) - visibleState.bufferCount
    visibleState.end = visibleState.start + visibleState.renderCount + 1 + visibleState.bufferCount
    visibleState.currentOffset = visibleState.start > 0
      ? positions[visibleState.start - 1].bottom
      : 0
    // console.log(visibleState)
  }, 16), slateRef)

  // 更新position
  const updatePosition = useCallback((index: number, height: number): void => {
    setPosition((prev) => {
      if (index < 0 || Math.abs(prev[index]?.height - height) <= 1) {
        return prev
      }

      const newPositions = [...prev]
      newPositions[index].height = height
      newPositions[index].top = newPositions[index - 1].bottom
      newPositions[index].bottom = newPositions[index].top + height

      for (let i = index + 1; i < newPositions.length; i++) {
        newPositions[i].top = newPositions[i - 1].bottom
        newPositions[i].bottom = newPositions[i].top + newPositions[i].height
      }

      return newPositions
    })
  }, [])

  // 切换笔记
  useEffect(() => {
    if (activeNote) {
      Transforms.delete(editor, {
        at: {
          anchor: Editor.start(editor, []),
          focus: Editor.end(editor, []),
        },
      })
      Transforms.insertFragment(editor, value)
      // 强制重置选区
      Transforms.deselect(editor)
      // 清空操作历史
      editor.history = { undos: [], redos: [] }
    }
  }, [activeNoteId])
  // 渲染块级格式
  const renderElement = useRenderElement(
    [visibleState.start, visibleState.end],
    updatePosition,
  )

  // 渲染字符集格式
  const renderLeaf = useRenderLeaf()

  // 渲染装饰格式
  const decorate = useDecorate(editor)

  // 处理指令函数
  const onKeyDown = useOnKeyDown(editor)

  // 获取当前主题
  const { darkTheme } = useSelector(getSettings)

  // 行号计算函数
  const getLineNumbers = useCallback(() => {
    let lineNumber = 1
    const updateNodes: [Path, number][] = []

    const blockTypes = new Set([...BlockType])

    for (const [node, path] of Editor.nodes<CustomElement>(editor, {
      at: [],
      mode: 'highest',
      match: n => Element.isElement(n) && blockTypes.has(n.type as string),
    })) {
      if (node.type === 'code-block' || node.type === 'bulleted-list' || node.type === 'numbered-list') {
        node.children.forEach((_, childIndex) => {
          const childPath = [...path, childIndex]
          updateNodes.push([childPath, lineNumber++])
        })
      } else {
        updateNodes.push([path, lineNumber++])
      }
    }

    Editor.withoutNormalizing(editor, () => {
      updateNodes.forEach(([path, newNumber]) => {
        if (Node.has(editor, path)) {
          const [node] = Editor.node(editor, path)
          if ((node as CustomElement).lineNumber !== newNumber) {
            Transforms.setNodes(editor, { lineNumber: newNumber }, { at: path })
          }
        }
      })
    })
  }, [editor])

  // 动态渲染line-number
  useEffect(() => {
    getLineNumbers()
  }, [editor, getLineNumbers, value])

  // 动态引入code-block主题
  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = `/prismjs/themes/prism${darkTheme ? '-tomorrow' : '-coy'}.css`
    document.head.appendChild(link)

    return () => {
      document.head.removeChild(link)
    }
  }, [darkTheme])

  // 更新note内容防抖机制
  const debounceUpdate = useRef(
    _.debounce((noteData: noteItem) => {
      dispatch(updateNote(noteData))
    }, 500),
  )

  // 监听数据和光标变化
  const editUpdate = (value: Descendant[], editor: CustomEditor) => {
    const edit = editRef.current
    if (!edit)
      return
    const isAstChange = editor.operations.some(
      (op: Operation) => op.type !== 'set_selection',
    )
    if (isAstChange) {
      getLineNumbers()
      flattedArr = flatArr(value)
      const initPos = positionInit(flattedArr, visibleState.initItemHeight)
      setPosition(initPos)
      const noteData: noteItem = activeNote
        ? {
            id: activeNote?.id,
            title: activeNote.title,
            content: value,
            createdAt: activeNote.createdAt,
            updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            scratchpad: !!isScratchpad,
          } as noteItem
        : emptyNote

      debounceUpdate.current(noteData)
    }
  }

  //  自定义复制事件
  const handleCopy = (event: React.ClipboardEvent<HTMLDivElement>) => {
    const { selection } = editor
    if (!selection)
      return

    const fragment = Editor.fragment(editor, selection)
    const selectedText = fragment.map((node) => {
      if (Element.isElement(node) && BlockType.includes(node.type as string)) {
        return node.children.map(node => Node.string(node)).join('\n')
      }
      return Node.string(node)
    })
      .join('\n')
    const filteredText = selectedText.replace(/^\d+\s+/gm, '')

    event.clipboardData?.setData('text/plain', filteredText)
    event.preventDefault()
  }

  return (
    <div className="notebook" ref={containerRef}>
      <div
        className="slate"
        data-theme={darkTheme ? 'dark' : 'light'}
        ref={slateRef}
        style={{
          height: visibleState.scrollAllHeight,
          overflow: 'auto',
          position: 'relative',
        }}
      >
        <div
          className="slate-virtual-placeholder"
          style={{
            minHeight: visibleState.listHeight,
            position: 'absolute',
            left: 0,
            top: 0,
            right: 0,
          }}
        >
          <Slate
          // key={activeNoteId}
            editor={editor}
            initialValue={value}
            onChange={(value) => {
              editUpdate(value, editor)
            }}
          >
            <ToolBar />
            <SetNodeToDecorations />
            <Editable
              ref={editRef}
              className="editable"
              data-theme={darkTheme ? 'dark' : 'light'}
              style={{
                outline: 'none',
                transform: `translateY(${visibleState.currentOffset}px)`,
                // willChange: 'transform',
                position: 'relative',
                left: 0,
                top: 0,
                right: 0,
              }}
              decorate={decorate}
              renderElement={renderElement}
              renderLeaf={renderLeaf}
              onKeyDown={onKeyDown}
              onCopy={handleCopy}
              spellCheck={false}
            />
          </Slate>
        </div>
      </div>
    </div>
  )
}

export default DefaultEditor
