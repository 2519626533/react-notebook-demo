import type { CodeBlockElement, CustomElement, CustomText } from '@/types/slate'
import LanguageSelector from '@/components/element/LanguageSelector'
import { getSettings } from '@/store/selector'
import _ from 'lodash'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { Editor, Path, Transforms } from 'slate'
import { ReactEditor, type RenderElementProps, type RenderLeafProps, useSlate } from 'slate-react'

// Element
const MyElement: React.FC<RenderElementProps> = ({ attributes, children, element }) => {
  const { align = 'left' } = element as { align?: 'left' | 'right' | 'center' | 'justify' }
  const editor = useSlate()
  const { darkTheme } = useSelector(getSettings)
  const style: React.CSSProperties = { textAlign: align }
  const lineNumber = element.lineNumber || ''
  const isEmpty = lineNumber === ''

  const path = ReactEditor.findPath(editor, element)
  let isActive = false

  // 高亮所选行
  if (editor.selection) {
    const blockEntry = Editor.above(editor, {
      at: editor.selection,
      match: n => Editor.isBlock(editor, n as CustomElement),
    })
    if (blockEntry) {
      const [, blockPath] = blockEntry
      if (Path.equals(path, blockPath)) {
        isActive = true
      }
    }
  }

  return (
    <div
      className="element-container"
      data-line-index={element.lineNumber}
    >
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
                  className={isActive ? 'active-line' : ''}
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
                <h2
                  className={isActive ? 'active-line' : ''}
                  style={style}
                  {...attributes}
                  data-theme={darkTheme ? 'dark' : 'light'}
                >
                  {children}
                </h2>
              )
            )
          case 'block-quote':
            return (
              <blockquote
                className={isActive ? 'active-line' : ''}
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
                  className={isActive ? 'active-line' : ''}
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
              <div
                className={isActive ? 'active-line' : ''}
                {...attributes}
                style={{ position: 'relative' }}
                data-theme={darkTheme ? 'dark' : 'light'}
              >
                {children}
              </div>
            )
          default:
            return (
              (
                <div
                  className={isActive ? 'active-line' : ''}
                  style={style}
                  {...attributes}
                  data-theme={darkTheme ? 'dark' : 'light'}
                >
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
  // console.log(leaf)
  if (leaf.bold) {
    children = <strong>{children}</strong>
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
        ...(leaf.url && {
          color: '#117A65',
          wordBreak: 'break-word',
        }),
        ...(leaf.mdLink && {
          textDecoration: 'underline',
          color: '#76448A',
        }),
        ...(leaf.uuid && {
          fontStyle: 'italic',
          color: '#1ABC9C',
        }),
        // ...(leaf.activeLine && {
        //   backgroundColor: 'red',
        // }),
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
