import type { LIST_TYPES, TEXT_ALGIN_TYPES } from '@/utils/editorFunctions'
import type { InputNodeTypes, NodeTypes } from 'remark-slate'
import type { BaseEditor, Descendant } from 'slate'
import type { HistoryEditor } from 'slate-history'
import type { ReactEditor } from 'slate-react'

// 编辑样式类型
export type CodeBlockElement = {
  type: 'code-block'
  language: string
  children: Descendant[]
  lineNumber?: number
}

export type CodeLineElement = {
  type: 'code-line'
  children: Descendant[]
  lineNumber?: number
}

type CustomElement =
  | CodeBlockElement
  | CodeLineElement
  | { type: null, children: Descendant[], lineNumber?: number }
  | {
    type: string
    align?: string
    children: Descendant[]
    lineNumber?: number
  }

export interface MyNodeTypes extends NodeTypes {
  paragraph: 'paragraph'
  block_quote: 'block-quote'
  code_block: 'code-block'
  link: 'link'
  ul_list: 'bulleted-list'
  ol_list: 'numbered-list'
  listItem: 'list-item'
  heading: {
    1: 'heading-one'
    2: 'heading-two'
    3: 'heading-three'
    4: 'heading-four'
    5: 'heading-five'
    6: 'heading-six'
  }
  emphasis_mark: 'italic'
  strong_mark: 'bold'
  delete_mark: 'strikeThrough'
  inline_code_mark: 'code'
  thematic_break: 'thematic_break'
  image: 'image'
}

export type CustomText = {
  text: string
  bold?: true
  underline?: true
  italic?: boolean
  code?: boolean
  url?: boolean
  mdLink?: boolean
  uuid?: boolean
  activeLine?: boolean
}

export type EmptyText = {
  text: string
}

type ListType = typeof LIST_TYPES[number]
type TextAlginType = typeof TEXT_ALGIN_TYPES[number]
type BlockType = | 'paragraph' | 'heading-one' | 'heading-two' | 'block-quote' | 'list-item' | 'code-block'
type MarkType = keyof Omit<CustomText, 'text'>
type CodeType = 'code-block' | 'code-line'

export type CustomFormat =
  | MarkType
  | ListType
  | TextAlginType
  | BlockType
  | CodeType

export type CustomEditor =
  BaseEditor &
  ReactEditor &
  HistoryEditor &
  {
    nodeToDecorations?: Map<CustomElement, Range[]>
  }

// Slate Button type
type BaseProps = {
  className: string
  [key: string]: unknown
}

declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor & ReactEditor & HistoryEditor
    Element: CustomElement
    Text: CustomText | EmptyText
    Range: BaseRange & {
      [key: string]: unknown
    }
  }
}
