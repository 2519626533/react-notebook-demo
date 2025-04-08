export interface NodeTypes {
  paragraph: string
  block_quote: string
  code_block: string
  link: string
  ul_list: string
  ol_list: string
  listItem: string
  heading: {
    1: string
    2: string
  }
  emphasis_mark: string
  strong_mark: string
  delete_mark: string
  inline_code_mark: string
  thematic_break: string
  image: string
}

export const defaultNodeTypes: NodeTypes = {
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
  },
  emphasis_mark: 'italic',
  strong_mark: 'bold',
  delete_mark: 'strikeThrough',
  inline_code_mark: 'code',
  thematic_break: 'thematic_break',
  image: 'image',
}

export interface LeafType {
  text: string
  parentType?: string
  strikeThrough?: boolean
  bold?: boolean
  italic?: boolean
  code?: boolean
}

export interface BlockType {
  type: string
  parentType?: string
  link?: string
  caption?: string
  language?: string
  break?: boolean
  children: Array<BlockType | LeafType>
}

export interface Options {
  nodeTypes: NodeTypes
  listDepth?: number
  ignoreParagraphNewline?: boolean
}
