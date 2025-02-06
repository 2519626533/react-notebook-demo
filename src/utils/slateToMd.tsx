import type { CustomElement, MyNodeTypes } from '@/types/slate'
import { BlockType, myRemarkSlateNodeTypes } from '@/types/components'
import { type OptionType, serialize } from 'remark-slate'
import { Element, Node } from 'slate'

const remarkSlateOpts: OptionType<MyNodeTypes> & { nodeTypes: MyNodeTypes } = {
  nodeTypes: myRemarkSlateNodeTypes,
}

export const slateToMd = (content: CustomElement[]) => {
  const markdownContent: string = content
    .filter(value => value.children.some(child => child.text !== ''))
    .map((value) => {
      if (Element.isElement(value) && BlockType.includes(value.type as string)) {
        if (value.type === 'code-block') {
          const modifiedCodeBlock: CustomElement = {
            ...value,
            children: value.children.map((codeLine) => {
              const modifiedCodeLine = {
                ...codeLine,
                children: codeLine.children.map((textNode) => {
                  if ('text' in textNode) {
                    const text = textNode.text.endsWith('\n')
                      ? textNode.text
                      : `${textNode.text}\n`
                    return { ...textNode, text }
                  }
                  return textNode
                }),
              }
              return modifiedCodeLine
            }),
          }
          return serialize(modifiedCodeBlock, remarkSlateOpts)
        } else if (value.type === 'numbered-list' || value.type === 'bulleted-list') {
          const liItem = value.children.map((child) => {
            let tempItem = serialize(child, remarkSlateOpts)
            if (!tempItem?.endsWith('\n')) {
              tempItem = `${tempItem}\n`
            }
            return tempItem
          },
          ).join('')
          return liItem
        } else {
          return serialize(value, remarkSlateOpts)
        }
      } else {
        return Node.string(value)
      }
    })
    .join('\n')
    .replace(/&amp;lt;/g, '<')
    .replace(/&amp;gt;/g, '>')
    .replace(/&amp;#39;/g, '\'')
    .replace(/&amp;quot;/g, '\"')
    .replace(/&amp;amp;/g, '\&')
  return markdownContent
}
