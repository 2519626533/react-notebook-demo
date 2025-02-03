import type { CustomEditor, CustomElement } from '@/types/slate'
import { setContent } from '@/store/note'
import { getNotes } from '@/store/selector'
import { BlockType } from '@/types/components'
import { SetNodeToDecorations } from '@/utils/decorationsFn'
import { useDecorate, useOnKeyDown, useRenderElement, useRenderLeaf } from '@/utils/editorFunctions'
import Prism from 'prismjs'
import { useEffect, useMemo, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createEditor, type Descendant, Editor, Element, Node, type Operation, Transforms } from 'slate'
import { withHistory } from 'slate-history'
import { Editable, Slate, withReact } from 'slate-react'
import ToolBar from './ToolBar'

// EditArea主体
const DefaultEditor = () => {
  const editRef = useRef<HTMLDivElement>(null)
  const dispatch = useDispatch()

  // 创建Slate
  const editor = useMemo(() => {
    const editor = withHistory(withReact(createEditor()))
    editor.nodeToDecorations = new Map()
    return editor
  }, [])

  // 初始化数据
  const { content } = useSelector(getNotes)
  const value: Descendant[] = content

  // 渲染块级格式
  const renderElement = useRenderElement()

  // 渲染字符集格式
  const renderLeaf = useRenderLeaf()

  // 渲染装饰格式
  const decorate = useDecorate(editor)

  // 处理指令函数
  const onKeyDown = useOnKeyDown(editor)

  const getLineNumbers = () => {
    let lineNumber = 1

    const processNode = (node: CustomElement, path: number[]) => {
      if (node.type === 'code-block' || node.type === 'bulleted-list' || node.type === 'numbered-list') {
        node.children.forEach((child, childIndex) => {
          const childPath = [...path, childIndex]
          Transforms.setNodes(
            editor,
            { lineNumber: lineNumber++ },
            {
              at: childPath,
              match: n => n === child,
            },
          )
        })
      } else {
        Transforms.setNodes(
          editor,
          {
            lineNumber: lineNumber++,
          },
          {
            at: path,
            match: n => n === node && BlockType.includes(n.type),
          },
        )
      }
    }

    editor.children.forEach((node: CustomElement, index: number) => {
      processNode(node, [index])
    })
  }

  useEffect(() => {
    // 初始计算
    getLineNumbers()
  }, [editor])

  useEffect(() => {
    Prism.highlightAll()
  }, [value])

  const editUpdate = (value: Descendant[], editor: CustomEditor) => {
    const isAstChange = editor.operations.some(
      (op: Operation) => op.type !== 'set_selection',
    )
    if (isAstChange) {
      getLineNumbers()
      dispatch(setContent(value))
    }
  }

  // 高亮所选行
  const activeSelection = (event: React.MouseEvent<HTMLDivElement>) => {
    const edit = editRef.current
    if (!edit)
      return
    const target = event.target as HTMLElement

    const lineElement = target.closest('[data-slate-node="element"]')

    if (lineElement) {
      const allLines = edit.querySelectorAll('[data-slate-node="element"]')
      allLines.forEach((line) => {
        line.classList.remove('active-line')
      })
      lineElement.classList.add('active-line')
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
      <div className="slate">
        <Slate
          editor={editor}
          initialValue={value}
          onChange={value => editUpdate(value, editor)}
        >
          <ToolBar />
          <SetNodeToDecorations />
          <Editable
            ref={editRef}
            style={{ outline: 'none' }}
            decorate={decorate}
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            onKeyDown={onKeyDown}
            onMouseDown={activeSelection}
            onCopy={handleCopy}
            className="editable"
            spellCheck={false}
          />
        </Slate>
      </div>
    </div>

  )
}

export default DefaultEditor
