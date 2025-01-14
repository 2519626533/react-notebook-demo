import type { CustomText } from '@/types/slate'
import type { RenderElementProps, RenderLeafProps } from 'slate-react'

// Element
const MyElement: React.FC<RenderElementProps> = ({ attributes, children, element }) => {
  const { align = 'left' } = element as { align?: 'left' | 'right' | 'center' | 'justify' }
  const style: React.CSSProperties = { textAlign: align }

  switch (element.type) {
    case 'block-quote':
      return (
        <blockquote style={style} {...attributes}>
          {children}
        </blockquote>
      )

    case 'bulleted-list':
      return (
        (
          <ul style={style} {...attributes}>
            {children}
          </ul>
        )
      )
    case 'heading-one':
      return (
        (
          <h1 style={style} {...attributes}>
            {children}
          </h1>
        )
      )
    case 'heading-two':
      return (
        (
          <h2 style={style} {...attributes}>
            {children}
          </h2>
        )
      )
    case 'list-item':
      return (
        (
          <li style={style} {...attributes}>
            {children}
          </li>
        )
      )
    case 'numbered-list':
      return (
        (
          <ol style={style} {...attributes}>
            {children}
          </ol>
        )
      )
    default:
      return (
        (
          <p style={style} {...attributes}>
            {children}
          </p>
        )
      )
  }
}

// 定义一个 React 组件来渲染带有粗体文本的叶子
const Leaf: React.FC<RenderLeafProps & { leaf: CustomText }> = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>
  }

  if (leaf.code) {
    children = <code>{children}</code>
  }

  if (leaf.italic) {
    children = <em>{children}</em>
  }

  if (leaf.underline) {
    children = <u>{children}</u>
  }
  return (
    <span {...attributes}>{children}</span>
  )
}

export {
  Leaf,
  MyElement,
}
