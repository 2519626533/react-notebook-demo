import type { CustomEditor, CustomFormat, CustomText, ListType, MarkType, TextAlginType } from '@/types/slate'
import { Editor, Element, Element as SlateElement, Transforms } from 'slate'

// ------------------------------------------------------------------------------------------------------------------------------------
/*
    普通函数
*/
// 定义对其类型和列表类型
const TEXT_ALGIN_TYPES = ['left', 'center', 'right', 'justify'] as const
const LIST_TYPES = ['numbered-list', 'bulleted-list'] as const
// 定义我们自己的自定义助手集

// 检查当前选区是否包含指定的块级样式
const isBlockActive = (editor: CustomEditor, format: CustomFormat, blockType: 'type' | 'align' = 'type') => {
  const { selection } = editor
  if (!selection)
    return false

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: n =>
        !Editor.isEditor(n)
        && SlateElement.isElement(n)
        && n[blockType] === format,
    }),
  )

  return !!match
}

// 检查当前选区是否激活了指定的内联样式（如加粗、斜体等）
const isMarkActive = (editor: CustomEditor, format: CustomFormat) => {
  const marks = Editor.marks(editor) as CustomText | null
  return marks ? marks[format as MarkType] === true : false
}

// 切换内联样式（如加粗、斜体、下划线等）
const toggleMark = (editor: CustomEditor, format: CustomFormat) => {
  const isActive = isMarkActive(editor, format)

  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}

// 用于切换块级样式（如标题、对齐方式、列表等）
const toggleBlock = (editor: CustomEditor, format: CustomFormat) => {
  const isActive = isBlockActive(
    editor,
    format,
    TEXT_ALGIN_TYPES.includes(format as TextAlginType) ? 'align' : 'type',
  )
  const isList = LIST_TYPES.includes(format as ListType)

  Transforms.unwrapNodes(editor, {
    match: node =>
      !Editor.isEditor(node)
      && SlateElement.isElement(node)
      && LIST_TYPES.includes(node.type as ListType)
      && !TEXT_ALGIN_TYPES.includes(format as TextAlginType),
    split: true,
  })
  let newProperties: Partial<SlateElement>
  if (TEXT_ALGIN_TYPES.includes(format as TextAlginType)) {
    newProperties = {
      align: isActive ? undefined : format,
    }
  } else {
    newProperties = {
      type: isActive ? 'paragraph' : isList ? 'list-item' : format,
    }
  }
  Transforms.setNodes<SlateElement>(editor, newProperties)

  if (!isActive && isList) {
    const block = { type: format, children: [] }
    Transforms.wrapNodes(editor, block)
  }
}

// 用于切换codeblock样式
const toggleCodeBlock = (editor: CustomEditor, isActive: boolean) => {
  if (isActive) {
    Transforms.unwrapNodes(editor, {
      match: n => Element.isElement(n) && n.type === 'code-block',
      split: true,
    })
    Transforms.setNodes(
      editor,
      { type: 'paragraph' },
      { match: n => Element.isElement(n) && n.type === 'code-line' },
    )
  } else {
    Transforms.wrapNodes(
      editor,
      { type: 'code-block', language: 'jsx', children: [{ text: '' }] },
      {
        match: n => Element.isElement(n) && n.type === 'paragraph',
        split: true,
      },
    )
    Transforms.setNodes(
      editor,
      { type: 'code-line' },
      { match: n => Element.isElement(n) && n.type === 'paragraph' },
    )
  }
}

export {
  isBlockActive,
  isMarkActive,
  LIST_TYPES,
  TEXT_ALGIN_TYPES,
  toggleBlock,
  toggleCodeBlock,
  toggleMark,
}
