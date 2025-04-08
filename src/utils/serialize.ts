import { type BlockType, defaultNodeTypes, type LeafType, type NodeTypes, type Options } from '@/types/ast-types'
import escapeHTML from 'escape-html'

const isLeafNode = (node: BlockType | LeafType): node is LeafType => {
  return 'text' in node && typeof node.text === 'string'
}

const reverseStr = (string: string): string => string.split('').reverse().join('')

const formatString = (string: string, format: string) => {
  const frozenString = string.trim()

  const children = frozenString

  const fullFormat = `${format}${children}${reverseStr(format)}`

  if (children.length === string.length) {
    return fullFormat
  }

  const formattedString = format + children + reverseStr(format)

  return string.replace(frozenString, formattedString)
}

const VOID_ELEMENT: Array<keyof NodeTypes> = ['thematic_break', 'image']

const BREAK_TAG = '<br>'

export const serialize = (
  chunk: BlockType | LeafType,
  opts: Options,
) => {
  const {
    nodeTypes: userNodeTypes = defaultNodeTypes,
    ignoreParagraphNewline = false,
    listDepth = 0,
  } = opts

  const text = (chunk as LeafType).text || ''
  let type = (chunk as BlockType).type || ''

  const nodeTypes: NodeTypes = {
    ...defaultNodeTypes,
    ...userNodeTypes,
    heading: {
      ...defaultNodeTypes.heading,
      ...userNodeTypes.heading,
    },
  }

  const LIST_TYPES = [nodeTypes.ul_list, nodeTypes.ol_list]

  let children = text

  if (!isLeafNode(chunk)) {
    children = chunk.children.map((c: BlockType | LeafType) => {
      const isList = !isLeafNode(c)
        ? (LIST_TYPES).includes(c.type || '')
        : false

      const selfIsList = (LIST_TYPES).includes(chunk.type || '')

      let childrenHasLink = false

      if (!isLeafNode(chunk) && Array.isArray(chunk.children)) {
        childrenHasLink = chunk.children.some(f => !isLeafNode(f) && f.type === nodeTypes.link)
      }

      return serialize(
        { ...c, parentType: type },
        {
          nodeTypes,
          ignoreParagraphNewline: (
            ignoreParagraphNewline || isList || selfIsList || childrenHasLink)
          && !(c as BlockType).break,
          listDepth: (LIST_TYPES).includes(
            (c as BlockType).type || '',
          )
            ? listDepth + 1
            : listDepth,
        },
      )
    }).join('')
  }

  if (!ignoreParagraphNewline && (text === '' || text === '\n') && chunk.parentType === nodeTypes.paragraph) {
    type = nodeTypes.paragraph
    children = BREAK_TAG
  }

  if (children === '' && !VOID_ELEMENT.find(k => nodeTypes[k] === type)) {
    return
  }
  if (children !== BREAK_TAG && isLeafNode(chunk)) {
    if (chunk.strikeThrough && chunk.bold && chunk.italic) {
      children = formatString(children, '~~***')
    } else if (chunk.bold && chunk.italic) {
      children = formatString(children, '***')
    } else {
      if (chunk.bold) {
        children = formatString(children, '**')
      }
      if (chunk.italic) {
        children = formatString(children, '_')
      }
      if (chunk.strikeThrough) {
        children = formatString(children, '~~')
      }
      if (chunk.code) {
        children = formatString(children, '`')
      }
    }
  }

  switch (type) {
    case nodeTypes.heading[1]: return `#${children}\n`
    case nodeTypes.heading[2]: return `##${children}\n`
    case nodeTypes.code_block:
      return `\`\`\`${
        (chunk as BlockType).language || ''
      }\n${children}\n\`\`\`\n`
    case nodeTypes.block_quote: return `>${children}\n\n`
    case nodeTypes.link: return `[${children}](${(chunk as BlockType).link || ''})`
    case nodeTypes.image: return `![${(chunk as BlockType).caption}](${(chunk as BlockType).link || ''})`
    case nodeTypes.ul_list:
    case nodeTypes.ol_list:
      return `\n${children}\n`
    case nodeTypes.listItem:{
      const isOL = chunk && chunk.parentType === nodeTypes.ol_list
      const treatASLeaf = (chunk as BlockType).children.length === 1
        && isLeafNode((chunk as BlockType).children[0])
      let space = ''
      for (let k = 0; k < listDepth; k++) {
        if (isOL) {
          space += '   '
        } else {
          space += '  '
        }
      }
      return `${space}${isOL ? '1.' : '-'} ${children}${treatASLeaf ? '\n' : ''}`
    }
    case nodeTypes.paragraph: return `${children}\n`
    case nodeTypes.thematic_break: return `---\n`
    default: return escapeHTML(children)
  }
}
