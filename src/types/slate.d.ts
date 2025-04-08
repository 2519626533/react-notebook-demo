import type { LIST_TYPES, TEXT_ALGIN_TYPES } from '@/utils/editorFunctions'
import type { InputNodeTypes, NodeTypes } from 'remark-slate'
import type { BaseEditor, Descendant } from 'slate'
import type { HistoryEditor } from 'slate-history'
import type { ReactEditor } from 'slate-react'

// 多行块级元素
export type MultiBlockElement =
  | CodeBlockElement
  | BulletedListElement
  | NumberedListElement

export type CodeBlockElement = {
  type: 'code-block'
  language: string
  children: CodeLineElement[]
  startIndex?: number
  endIndex?: number
  lineNumber?: number
}

export type BulletedListElement = {
  type: 'bulleted-list'
  children: ListItemElement[]
  startIndex?: number
  endIndex?: number
  lineNumber?: number
}

export type NumberedListElement = {
  type: 'numbered-list'
  children: ListItemElement[]
  startIndex?: number
  endIndex?: number
  lineNumber?: number
}

// 单行块级元素
// export type SingleBlockElement =
//   | ListItemElement
//   | CodeLineElement
//   | HeadingOneElement
//   | HeadingTwoElement

// export type ListItemElement = {
//   type: 'list-item'
//   children: Descendant[]
//   lineNumber: number
// }

// export type CodeLineElement = {
//   type: 'code-line'
//   children: Descendant[]
//   lineNumber: number
// }

// export type HeadingOneElement = {
//   type: 'heading-one'
//   children: Descendant[]
//   lineNumber: number
// }

// export type HeadingTwoElement = {
//   type: 'heading-two'
//   children: Descendant[]
//   lineNumber: number
// }

// export type BlockQuoteElement = {
//   type: 'block-quote'
//   children: Descendant[]
//   lineNumber: number
// }

type CustomElement =
  | MultiBlockElement
  | {
    type: string
    align?: string
    children: Descendant[]
    lineNumber?: number
    startIndex?: number
    endIndex?: number
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
type SlateBlockType = | 'paragraph' | 'heading-one' | 'heading-two' | 'block-quote' | 'list-item' | 'code-block'
type MarkType = keyof Omit<CustomText, 'text'>
type CodeType = 'code-block' | 'code-line'

export type CustomFormat =
  | MarkType
  | ListType
  | TextAlginType
  | SlateBlockType
  | CodeType

export type CustomEditor =
  BaseEditor &
  ReactEditor &
  HistoryEditor &
  {
    nodeToDecorations?: Map<CustomElement, Range[]>
  }

type BaseProps = {
  className: string
  [key: string]: unknown
}

declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor
    Element: CustomElement
    Text: CustomText | EmptyText
    Range: BaseRange & {
      [key: string]: unknown
    }
  }
}
