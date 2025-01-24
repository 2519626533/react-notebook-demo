import type { CustomEditor, CustomElement } from '@/types/slate'
import { setContent } from '@/store/note'
import { getNotes } from '@/store/selector'
import { SetNodeToDecorations } from '@/utils/decorationsFn'
import { useDecorate, useOnKeyDown, useRenderElement, useRenderLeaf } from '@/utils/editorFunctions'
import { useEffect, useMemo, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createEditor, type Descendant, type Operation, Transforms } from 'slate'
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
    editor.children.forEach((node: CustomElement, index: number) => {
      Transforms.setNodes(
        editor,
        { lineNumber: index + 1 },
        {
          at: [index],
          match: n => n === node,
        },
      )
    })
  }

  useEffect(() => {
    // 初始计算
    getLineNumbers()
  }, [editor])

  const editUpdate = (value: Descendant[], editor: CustomEditor) => {
    const isAstChange = editor.operations.some(
      (op: Operation) => op.type !== 'set_selection',
    )
    if (isAstChange) {
      getLineNumbers()
      dispatch(setContent(value))
    }
  }

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

  return (
    <div className="notebook">
      <div className="slate">
        <Slate
          editor={editor}
          initialValue={value}
          onChange={value => editUpdate(value, editor)}
        >
          <ToolBar />
          {/* <SetNodeToDecorations /> */}
          <Editable
            ref={editRef}
            style={{ outline: 'none' }}
            decorate={decorate}
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            onKeyDown={onKeyDown}
            onMouseDown={activeSelection}
            className="editable"
            spellCheck={false}
          />
        </Slate>
      </div>
    </div>

  )
}

export default DefaultEditor
