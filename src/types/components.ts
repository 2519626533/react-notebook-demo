import type { CustomElement, CustomFormat, MyNodeTypes } from './slate'

export type ButtonType = (props: {
  format: CustomFormat
  icon: React.ReactElement
}) => JSX.Element

export type MyIconProps = {
  fill: string
  active?: boolean
  text?: string
  textColor?: string
  fontSize?: number
  x?: number
  y?: number
  pathColor?: string
}

export type MyIcon = (props: MyIconProps) => JSX.Element

export type ToolBarPosition = {
  x: number
  y: number
}

export type hotkeys = {
  [key: string]: CustomFormat
}

export const BlockType = ['paragraph', 'heading-one', 'heading-two', 'block-quote', 'list-item', 'code-block', 'bulleted-list', 'numbered-list']
export const TextDecorationList = ['paragraph', 'block-quote', 'numbered-list', 'bulleted-list', 'list-item']
export const MARK_HOTKEYS: hotkeys = {
  'ctrl+b': 'bold',
  'ctrl+i': 'italic',
  'ctrl+u': 'underline',
}
export const BLOCK_HOTKEYS: hotkeys = {
  'ctrl+1': 'heading-one',
  'ctrl+2': 'heading-two',
  'ctrl+,': 'block-quote',
  'ctrl+o': 'numbered-list',
  'ctrl+l': 'bulleted-list',
  'ctrl+3': 'left',
  'ctrl+4': 'center',
  'ctrl+5': 'right',
  'ctrl+6': 'justify',
}
export const CODEBLOCK_HOTKEY: hotkeys = {
  'ctrl+`': 'code-block',
}

export const myRemarkSlateNodeTypes: MyNodeTypes = {
  paragraph: 'paragraph',
  block_quote: 'block-quote',
  code_block: 'code-block',
  link: 'link',
  ul_list: 'bulleted-list',
  ol_list: 'numbered-list',
  listItem: 'list-item',
  heading: {
    1: 'heading-one',
    2: 'heading-two',
    3: 'heading-three',
    4: 'heading-four',
    5: 'heading-five',
    6: 'heading-six',
  },
  emphasis_mark: 'italic',
  strong_mark: 'bold',
  delete_mark: 'strikeThrough',
  inline_code_mark: 'code',
  thematic_break: 'thematic_break',
  image: 'image',
} as unknown as MyNodeTypes

export const emptyElement: CustomElement = {
  type: 'paragraph',
  children: [{
    text: '',
  }],
  lineNumber: 1,
}
