import type { CustomElement } from '@/types/slate'
import type { BlockType, LeafType } from 'remark-slate'
import { Element } from 'slate'

export const convertSlateToRemarkType
  = (node: CustomElement): BlockType => {
    return {
      type: node.type as BlockType['type'],
      children: node.children.map(child =>
        Element.isElement(child)
          ? convertSlateToRemarkType(child)
          : child as LeafType),
    }
  }
