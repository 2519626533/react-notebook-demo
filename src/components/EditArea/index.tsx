import type { CustomElement } from '@/types/slate'
import { useOnKeyDown, useRenderElement, useRenderLeaf } from '@/utils/editorFunctions'
import { useState } from 'react'
import { createEditor } from 'slate'
import { Editable, Slate, withReact } from 'slate-react'
import ToolBar from '../ToolBar'
import './index.scss'

// EditArea主体
const EditArea = () => {
  // 创建Slate
  const [editor] = useState(() => withReact(createEditor()))

  // 初始化数据
  const initialValue: CustomElement[] = [
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
  ]
  const [value, setValue] = useState(initialValue)

  // 渲染块级格式
  const renderElement = useRenderElement()

  // 渲染字符集格式
  const renderLeaf = useRenderLeaf()

  // 处理指令函数
  const onKeyDown = useOnKeyDown(editor)

  return (
    <div className="notebook">
      <div className="Slate">
        <Slate
          editor={editor}
          initialValue={value}
        >
          <ToolBar></ToolBar>
          <Editable
            style={{ outline: 'none' }}
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            onKeyDown={onKeyDown}
            className="editable"
          />
        </Slate>
      </div>
    </div>

  )
}

export default EditArea
