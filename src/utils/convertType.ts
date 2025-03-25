import type { CodeBlockElement, CustomElement } from '@/types/slate'
import type { BlockType, LeafType } from 'remark-slate'
import { Element } from 'slate'

export const convertSlateToRemarkType
  = (node: CodeBlockElement | CustomElement): BlockType => {
    return {
      type: node.type as BlockType['type'],
      language: (node as CodeBlockElement).language,
      children: node.children.map(child =>
        Element.isElement(child)
          ? convertSlateToRemarkType(child)
          : child as LeafType),
    }
  }
