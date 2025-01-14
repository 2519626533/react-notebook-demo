import type { CustomEditor, CustomElement, CustomText } from '@/types/slate'
import { useOnKeyDown, useRenderElement, useRenderLeaf } from '@/utils/editorFunctions'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createEditor, type Descendant, Editor, Node, type Operation } from 'slate'
import { Editable, Slate, withReact } from 'slate-react'
import ToolBar from '../ToolBar'

// EditArea主体
const EditArea = () => {
  const editRef = useRef<HTMLDivElement>(null)
  // 创建Slate
  const [editor] = useState(() => withReact(createEditor()))

  // 初始化数据
  const initialValue: CustomElement[] = useMemo(() =>
    JSON.parse(localStorage.getItem('content') as string) || [
      {
        type: 'paragraph',
        children: [
          { text: 'The Power of Small Steps\n', bold: true },
        ],
      },
      {
        type: 'paragraph',
        children: [
          { text: 'In life, we often dream big and set ambitious goals. However, it’s easy to feel overwhelmed by the enormity of these aspirations. The key to achieving them lies in taking small, consistent steps.\n' },
          { text: 'Every great journey begins with a single step. Whether it’s learning a new skill, improving health, or building a career, progress is made through daily efforts. Small actions, when repeated over time, compound into significant results. For example, reading just 10 pages a day can lead to finishing dozens of books in a year. Similarly, saving a little money regularly can grow into a substantial amount over time.\n' },
          { text: 'The beauty of small steps is that they are manageable and sustainable. They reduce the pressure of perfection and allow us to focus on the process rather than the outcome. By celebrating small wins, we stay motivated and build momentum.\n' },
          { text: 'Remember, Rome wasn’t built in a day. Embrace the power of small steps, and you’ll find yourself closer to your dreams than you ever imagined.\n' },
        ],
      },
    ], [])
  const [value, setValue] = useState(initialValue)

  // 渲染块级格式
  const renderElement = useRenderElement()

  // 渲染字符集格式
  const renderLeaf = useRenderLeaf()

  // 处理指令函数
  const onKeyDown = useOnKeyDown(editor)

  // 序列化
  const serialize = (value: Descendant[]) => {
    return (
      JSON.stringify(value)
    )
  }

  const editUpdate = (value: Descendant[], editor: CustomEditor) => {
    const isAstChange = editor.operations.some(
      (op: Operation) => op.type !== 'set_selection',
    )
    if (isAstChange) {
      value.forEach((node, index) => {
        if ('type' in node) {
          (node as CustomElement).lineNumber = index + 1
        }
      })
      localStorage.setItem('content', serialize(value))
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
      <div className="Slate">
        <Slate
          editor={editor}
          initialValue={value}
          onChange={value => editUpdate(value, editor)}
        >
          <ToolBar></ToolBar>
          <Editable
            ref={editRef}
            style={{ outline: 'none' }}
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

export default EditArea
