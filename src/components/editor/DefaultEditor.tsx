import type { NoteProps } from '@/types/layout'
import type { CustomEditor, CustomElement } from '@/types/slate'
import type { Descendant, Operation, Path } from 'slate'
import { updateNote } from '@/store/note'
import { getNotes, getSettings } from '@/store/selector'
import { BlockType, emptyElement } from '@/types/components'
import { emptyNote, type noteItem } from '@/types/slice'
import { SetNodeToDecorations } from '@/utils/decorationsFn'
import { useDecorate, useOnKeyDown, useRenderElement, useRenderLeaf } from '@/utils/editorHooks'
import { getActiveNote, getScratchpad } from '@/utils/notes-helps'
import dayjs from 'dayjs'
import _ from 'lodash'
import { useEffect, useMemo, useRef } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { createEditor, Editor, Element, Node, Transforms } from 'slate'
import { withHistory } from 'slate-history'
import { Editable, ReactEditor, Slate, withReact } from 'slate-react'
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
  const { notes, activeNoteId } = useSelector(getNotes, shallowEqual)
  const dispatch = useDispatch()

  // 创建Slate
  const editor = useMemo(() => {
    const editor = withHistory(withReact(createEditor()))
    editor.nodeToDecorations = new Map()
    return editor
  }, [activeNoteId])

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

  // 渲染块级格式
  const renderElement = useRenderElement()

  // 渲染字符集格式
  const renderLeaf = useRenderLeaf()

  // 渲染装饰格式
  const decorate = useDecorate(editor)

  // 处理指令函数
  const onKeyDown = useOnKeyDown(editor)

  // 获取当前主题
  const { darkTheme } = useSelector(getSettings)

  // 行号计算函数
  const getLineNumbers = () => {
    let lineNumber = 1
    const updateNodes: [Path, number][] = []

    const blockTypes = new Set(['code-block', 'bulleted-list', 'numbered-list', ...BlockType])

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
  }

  // 动态渲染line-number
  useEffect(() => {
    getLineNumbers()
  }, [editor, value])

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

  // // 修改 useEffect 逻辑，直接重置 editor 的 children 和 selection
  // useEffect(() => {
  //   if (activeNote) {
  //     // 强制重置选区
  //     Transforms.deselect(editor)
  //     // 清空操作历史
  //     editor.history = { undos: [], redos: [] }
  //   }
  // }, [activeNoteId])

  // 计时器延迟渲染toolBar
  // useEffect(() => {
  //   dispatch(updateIsEditorReady(false))
  //   const timerOut = setTimeout(() => {
  //     dispatch(updateIsEditorReady(true))
  //   }, 0)
  //   return () => clearTimeout(timerOut)
  // }, [activeNoteId, editor, dispatch])

  // if (!isScratchpad && !activeNote) {
  //   return null
  // }

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

      const noteData = activeNote
        ? {
            id: activeNote?.id,
            title: activeNote.title,
            content: value,
            createdAt: activeNote.createdAt,
            updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            scratchpad: !!isScratchpad,
          }
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
    <div className="notebook">
      <div className="slate" data-theme={darkTheme ? 'dark' : 'light'}>
        <Slate
          key={activeNoteId}
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
            style={{ outline: 'none' }}
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
  )
}

export default DefaultEditor
