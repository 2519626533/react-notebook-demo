import type { NoteProps } from '@/types/layout'
import type { CustomEditor, CustomElement } from '@/types/slate'
import { updateNote } from '@/store/note'
import { getNotes, getSettings } from '@/store/selector'
import { BlockType, emptyElement } from '@/types/components'
import { emptyNote } from '@/types/slice'
import { SetNodeToDecorations } from '@/utils/decorationsFn'
import { useDecorate, useOnKeyDown, useRenderElement, useRenderLeaf } from '@/utils/editorHooks'
import { getActiveNote, getScratchpad } from '@/utils/notes-helps'
import dayjs from 'dayjs'
import { useEffect, useMemo, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createEditor, type Descendant, Editor, Element, Node, type Operation, Path, Transforms } from 'slate'
import { withHistory } from 'slate-history'
import { Editable, ReactEditor, Slate, withReact } from 'slate-react'
import ToolBar from '../toolbar/ToolBar'

// EditArea主体
const DefaultEditor: React.FC<NoteProps> = ({ isScratchpad }) => {
  const editRef = useRef<HTMLDivElement>(null)
  const { notes, activeNoteId } = useSelector(getNotes)
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

    Array.from(Editor.nodes(editor, {
      at: [],
      match: n =>
        Element.isElement(n)
        && (n.type === 'code-block'
          || n.type === 'bulleted-list'
          || n.type === 'numbered-list'
          || BlockType.includes(n.type as string)),
      mode: 'highest',
    })).sort(([_, aPath], [__, bPath]) => Path.compare(aPath, bPath)).forEach(([node, path]) => {
      if (Element.isElement(node)) {
        if (node.type === 'code-block' || node.type === 'bulleted-list' || node.type === 'numbered-list') {
          node.children.forEach((child, childIndex) => {
            const childPath = [...path, childIndex]
            Transforms.setNodes(
              editor,
              { lineNumber: lineNumber++ },
              { at: childPath },
            )
          })
        } else if (BlockType.includes(node.type as string)) {
          Transforms.setNodes(
            editor,
            { lineNumber: lineNumber++ },
            { at: path },
          )
        }
      }
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
      dispatch(updateNote(activeNote
        ? {
            id: activeNote?.id,
            title: activeNote.title,
            content: value,
            createdAt: activeNote.createdAt,
            updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            scratchpad: !!isScratchpad,
          }
        : emptyNote))
    }
    if (editor.operations.some(
      (op: Operation) => op.type === 'set_selection' || op.type === 'split_node',
    )) {
      if (!editor.selection)
        return
      const nodeEntry = Editor.above(editor, {
        at: editor.selection.anchor,
        match: n => Editor.isBlock(editor, n as CustomElement),
      })
      if (!nodeEntry)
        return
      const [node] = nodeEntry
      try {
        const domNode = ReactEditor.toDOMNode(editor, node)
        if (domNode) {
          const allLines = edit.querySelectorAll('[data-slate-node="element"]')
          allLines.forEach((line) => {
            line.classList.remove('active-line')
          })
          domNode.classList.add('active-line')
        }
      } catch {
        setTimeout(() => {
          try {
            const domNode = ReactEditor.toDOMNode(editor, node)
            if (domNode) {
              const allLines = edit.querySelectorAll('[data-slate-node="element"]')
              allLines.forEach((line) => {
                line.classList.remove('active-line')
              })
              domNode.classList.add('active-line')
            }
          } catch {}
        }, 50)
      }
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
