import type { RootState } from '@/store'
import type { ButtonType } from '@/types/components'
import type { BaseProps, TextAlginType } from '@/types/slate'
import type { PropsWithChildren, Ref } from 'react'
import activeContext from '@/context/mycontext'
import { getPosition, setPosition } from '@/store/toolbarstore'
import { isBlockActive, isMarkActive, TEXT_ALGIN_TYPES, toggleBlock, toggleCodeBlock, toggleMark } from '@/utils/editorFunctions'
import { AlignCenterOutlined, AlignLeftOutlined, AlignRightOutlined, BoldOutlined, CodeOutlined, EditFilled, FullscreenExitOutlined, ItalicOutlined, OrderedListOutlined, UnderlineOutlined, UnorderedListOutlined } from '@ant-design/icons'
import classnames from 'classnames'
import _ from 'lodash'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSlate } from 'slate-react'
import { AlignJustifyIcon, HeadingOneIcon, HeadingTwoIcon, QuoteIcon } from '../element/MyIcon'

const Button = React.forwardRef<HTMLSpanElement, PropsWithChildren<{
  active: boolean
  reversed: boolean
} & BaseProps>>(
  ({ className, active, reversed, ...props }, ref: Ref<HTMLSpanElement>) => {
    const buttonClass = classnames(
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

// CodeButton组件
const CodeBlockButton: ButtonType = ({ format, icon }) => {
  const editor = useSlate()
  const isActive = isBlockActive(
    editor,
    format,
    TEXT_ALGIN_TYPES.includes(format as TextAlginType) ? 'align' : 'type',
  )
  const handleCodeBlock = (event: React.MouseEvent<HTMLSpanElement>) => {
    event.preventDefault()
    toggleCodeBlock(editor, isActive)
  }
  return (
    <Button
      active={isActive}
      onClick={handleCodeBlock}
    >
      <activeContext.Provider value={isActive}>
        {icon}
      </activeContext.Provider>
    </Button>
  )
}

const ToolBar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const position = useSelector((state: RootState) => state.toolbar.position)
  const dispatch = useDispatch()
  const [isDragging, setIsDragging] = useState(false)
  const [direction, setDirection] = useState<'row' | 'column' | 'row mirror' | 'column mirror'>('row')
  const toolBarRef = useRef<HTMLDivElement | null>(null) // 工具栏ref
  const toolBar = toolBarRef.current
  const layoutContent = document.querySelector('.ant-layout-content')
  const currentWindowHeight = window.innerHeight
  const editor = useSlate()
  const { selection } = editor

  useEffect(() => {
    dispatch(getPosition())
  }, [dispatch])

  // 监视selection自动展开
  useEffect(() => {
    if (selection) {
      setIsOpen(true)
    }
  }, [selection])

  const toggleToolBar = () => {
    setIsOpen(!isOpen)
  }

  const checkBoundary = useCallback(_.debounce(() => {
    if (!toolBar || !layoutContent)
      return

    const toolBarRect = toolBar.getBoundingClientRect()
    const layoutRect = layoutContent.getBoundingClientRect()
    if (toolBarRect.left <= layoutRect.left) {
      setDirection('column')
    } else if ((toolBarRect.right >= (layoutRect.right - 2))
      && (toolBarRect.bottom < currentWindowHeight - 450)) { // 这里的450是ToolBar展开时的height
      setDirection('column')
    } else if ((toolBarRect.top <= 0)
      && (toolBarRect.right < layoutRect.right - 540)) { // 这里的540是ToolBar展开时的width
      setDirection('row')
    } else if (toolBarRect.bottom >= currentWindowHeight - 2) {
      setDirection('row')
    }
  }, 10), [currentWindowHeight])
  useEffect(() => {
    checkBoundary()
  }, [position, checkBoundary])

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const startX = e.clientX
    const startY = e.clientY
    const toolBar = toolBarRef.current
    const editor = toolBar?.nextElementSibling as HTMLElement | null
    const layoutContent = document.querySelector('.ant-layout-content')
    if (!toolBar || !editor || !layoutContent)
      return
    document.onselectstart
      = function () { return false }
    document.ondragstart
      = function () { return false }

    const handleMouseMove = (moveEvent: MouseEvent) => {
      let newX = (moveEvent.clientX - startX) + position.x
      let newY = (moveEvent.clientY - startY) + position.y

      const toolBarRect = toolBar.getBoundingClientRect()
      const layoutRect = layoutContent.getBoundingClientRect()

      setIsDragging(true)
      editor.style.pointerEvents = 'none'

      if (layoutRect) {
        const maxX = layoutRect.right - toolBarRect.width
        const maxY = currentWindowHeight - toolBarRect.height
        const minX = layoutRect.left
        const minY = 0

        newX = Math.max(minX, Math.min(newX, maxX))
        newY = Math.max(minY, Math.min(newY, maxY))
      }

      dispatch(setPosition({ x: newX, y: newY }))
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      setIsDragging(false)
      editor.style.pointerEvents = ''
      document.onselectstart = null
      document.ondragstart = null
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [position, currentWindowHeight, dispatch])

  return (
    <div
      ref={toolBarRef}
      className={classnames('ToolBar-container', direction, {
        open: isOpen,
        dragging: isDragging,
      })}
      style={{ left: position.x, top: position.y }}
      onMouseDown={handleMouseDown}
    >
      <div className="ToolBar-toggle" onClick={toggleToolBar}>
        {isOpen ? <FullscreenExitOutlined style={{ color: '#FB4A4A' }} /> : <EditFilled style={{ color: '#D1F2EB' }} />}
      </div>
      <div className={classnames('ToolBar', direction)} style={{ display: isOpen ? '' : 'none' }}>
        <MarkButton format="bold" icon={<BoldOutlined />} />
        <MarkButton format="italic" icon={<ItalicOutlined />} />
        <MarkButton format="underline" icon={<UnderlineOutlined />} />
        <CodeBlockButton format="code-block" icon={<CodeOutlined />} />
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
    </div>

  )
}

export default ToolBar
