import type { CodeBlockElement, CustomText } from '@/types/slate'
import LanguageSelector from '@/components/LanguageSelector'
import { Transforms } from 'slate'
import { ReactEditor, type RenderElementProps, type RenderLeafProps, useSlate } from 'slate-react'

// Element
const MyElement: React.FC<RenderElementProps> = ({ attributes, children, element }) => {
  const { align = 'left' } = element as { align?: 'left' | 'right' | 'center' | 'justify' }
  const editor = useSlate()
  const style: React.CSSProperties = { textAlign: align }
  const lineNumber = element.lineNumber || ''
  const isEmpty = (lineNumber === '')
  return (
    <div className="element-container">
      {/* 行号容器 */}
      {!isEmpty && (
        <div className="line-wrapper" contentEditable={false}>
          <div className="line-number">
            {lineNumber}
          </div>
        </div>
      )}
      {/* 内容 */}
      {(() => {
        switch (element.type) {
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
          case 'numbered-list':
            return (
              (
                <ol style={style} {...attributes}>
                  {children}
                </ol>
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
          case 'code-block':
          {
            const setLanguage = (language: string) => {
              const path = ReactEditor.findPath(editor, element)
              Transforms.setNodes(editor, { language }, { at: path })
            }
            return (
              <pre
                {...attributes}
              >
                <code
                  spellCheck={false}
                  style={{ padding: '0' }}
                >
                  {children}
                  <LanguageSelector
                    value={(element as CodeBlockElement).language}
                    onChange={e => setLanguage(e.target.value)}
                  />
                </code>
              </pre>
            )
          }
          case 'code-line':
            return (
              <div {...attributes} style={{ position: 'relative' }}>
                {children}
              </div>
            )
          default:
            return (
              (
                <div style={style} {...attributes}>
                  {children}
                </div>
              )
            )
        }
      })()}
    </div>
  )
}

// 定义一个 React 组件来渲染带有粗体文本的叶子
const Leaf: React.FC<RenderLeafProps & { leaf: CustomText }> = ({ attributes, children, leaf }) => {
  const { text, ...rest } = leaf
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
    <span {...attributes} className={Object.keys(rest).join(' ')}>{children}</span>
  )
}

export {
  Leaf,
  MyElement,
}
