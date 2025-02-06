import type { CodeBlockElement, CustomText } from '@/types/slate'
import LanguageSelector from '@/components/LanguageSelector'
import { getSettings } from '@/store/selector'
import { useSelector } from 'react-redux'
import { Transforms } from 'slate'
import { ReactEditor, type RenderElementProps, type RenderLeafProps, useSlate } from 'slate-react'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-tsx'
import 'prismjs/components/prism-markdown'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-php'
import 'prismjs/components/prism-sql'
import 'prismjs/components/prism-java'

// Element
const MyElement: React.FC<RenderElementProps> = ({ attributes, children, element }) => {
  const { align = 'left' } = element as { align?: 'left' | 'right' | 'center' | 'justify' }
  const editor = useSlate()
  const { darkTheme } = useSelector(getSettings)
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
                <h1
                  style={style}
                  {...attributes}
                  data-theme={darkTheme ? 'dark' : 'light'}
                >
                  {children}
                </h1>
              )
            )
          case 'heading-two':
            return (
              (
                <h2 style={style} {...attributes} data-theme={darkTheme ? 'dark' : 'light'}>
                  {children}
                </h2>
              )
            )
          case 'block-quote':
            return (
              <blockquote
                style={style}
                {...attributes}
                data-theme={darkTheme ? 'dark' : 'light'}
              >
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
                <li
                  style={style}
                  {...attributes}
                  data-theme={darkTheme ? 'dark' : 'light'}
                >
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
                  data-theme={darkTheme ? 'dark' : 'light'}
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
                <div style={style} {...attributes} data-theme={darkTheme ? 'dark' : 'light'}>
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
    <span
      {...attributes}
      className={Object.keys(rest).join(' ')}
      // 在渲染逻辑中处理样式叠加
      style={{
        ...(leaf.url && { color: '#52BE80' }),
        ...(leaf.mdLink && {
          textDecoration: 'underline',
          color: '#D2B4DE',
        }),
        ...(leaf.uuid && {
          fontStyle: 'italic',
          color: '#1ABC9C',
        }),
      }}
    >
      {children}
    </span>
  )
}

export {
  Leaf,
  MyElement,
}
