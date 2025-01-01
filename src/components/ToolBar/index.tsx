import type { BaseProps, TextAlginType } from '@/types/slate'
import type { ButtonType } from '@/types/ToolBar'
import type { PropsWithChildren, Ref } from 'react'
import { isBlockActive, isMarkActive, TEXT_ALGIN_TYPES, toggleBlock, toggleMark } from '@/utils/editorFunctions'
import { AlignCenterOutlined, AlignLeftOutlined, AlignRightOutlined, BoldOutlined, CodeOutlined, ItalicOutlined, OrderedListOutlined, UnderlineOutlined, UnorderedListOutlined } from '@ant-design/icons'
import classNames from 'classnames'
import React, { useContext } from 'react'
import { useSlate } from 'slate-react'
import { AlignJustifyIcon, HeadingOneIcon, HeadingTwoIcon, QuoteIcon } from '../MyIcon'
import './index.scss'

const Button = React.forwardRef<HTMLSpanElement, PropsWithChildren<{
  active: boolean
  reversed: boolean
} & BaseProps>>(
  ({ className, active, reversed, ...props }, ref: Ref<HTMLSpanElement>) => {
    const buttonClass = classNames(
      'button-default',
      {
        'button-active': active,
      },
    )
    return (
      <span
        {...props}
        ref={ref}
        className={buttonClass}
      />
    )
  },
)

// MarkButton组件
const MarkButton: ButtonType = ({ format, icon }) => {
  const editor = useSlate()
  return (
    <Button
      active={isMarkActive(editor, format)}
      onMouseDown={(event: React.MouseEvent<HTMLSpanElement>) => {
        event.preventDefault()
        toggleMark(editor, format)
      }}
    >
      {icon}
    </Button>
  )
}

export const activeContext = React.createContext<boolean>(false)
// BlockButton组件
const BlockButton: ButtonType = ({ format, icon }) => {
  const editor = useSlate()
  const isActive = isBlockActive(
    editor,
    format,
    TEXT_ALGIN_TYPES.includes(format as TextAlginType) ? 'align' : 'type',
  )
  return (
    <Button
      active={isActive}
      onMouseDown={(event: React.MouseEvent<HTMLSpanElement>) => {
        event.preventDefault()
        toggleBlock(editor, format)
      }}
    >
      <activeContext.Provider value={isActive}>
        {icon}
      </activeContext.Provider>

    </Button>
  )
}

const ToolBar = () => {
  return (
    <div className="ToolBar">
      <MarkButton format="bold" icon={<BoldOutlined />} />
      <MarkButton format="italic" icon={<ItalicOutlined />} />
      <MarkButton format="underline" icon={<UnderlineOutlined />} />
      <MarkButton format="code" icon={<CodeOutlined />} />
      <BlockButton format="heading-one" icon={<HeadingOneIcon />} />
      <BlockButton format="heading-two" icon={<HeadingTwoIcon />} />
      <BlockButton format="block-quote" icon={<QuoteIcon />} />
      <BlockButton format="numbered-list" icon={<OrderedListOutlined />} />
      <BlockButton format="bulleted-list" icon={<UnorderedListOutlined />} />
      <BlockButton format="left" icon={<AlignLeftOutlined />} />
      <BlockButton format="center" icon={<AlignCenterOutlined />} />
      <BlockButton format="right" icon={<AlignRightOutlined />} />
      <BlockButton format="justify" icon={<AlignJustifyIcon />} />
    </div>
  )
}

export default ToolBar
