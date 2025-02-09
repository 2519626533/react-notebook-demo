import type { NoteProps } from '@/types/layout'
import { getNotes, getSettings } from '@/store/selector'
import { emptyElement } from '@/types/components'
import { getActiveNote } from '@/utils/notes-helps'
import { slateToMd } from '@/utils/slateToMd'
import { useMemo } from 'react'
import Markdown from 'react-markdown'
import { useSelector } from 'react-redux'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { coy, tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism'
import rehypeRaw from 'rehype-raw'
import remarkBreaks from 'remark-breaks'
import remarkGfm from 'remark-gfm'

const PreviewEditor: React.FC<NoteProps> = ({ isScratchpad }) => {
  const { scratchpadContent, notes, activeNoteId } = useSelector(getNotes)
  const activeNote = useMemo(() => {
    return getActiveNote(notes, activeNoteId)
  }, [notes, activeNoteId])

  const value = useMemo(() => {
    if (!isScratchpad) {
      return activeNote ? activeNote.content : [emptyElement]
    }
    return scratchpadContent
  }, [isScratchpad, activeNote, scratchpadContent])

  const { darkTheme } = useSelector(getSettings)
  /*
 * Markdown 渲染函数
 */

  const renderPreviewEditor = () => {
    const markdownContent = slateToMd(value)
    return (
      <Markdown
        className="react-markdown"
        data-theme={darkTheme ? 'dark' : 'light'}
        children={markdownContent}
        remarkPlugins={[[remarkGfm], [remarkBreaks]]}
        rehypePlugins={[rehypeRaw]}
        components={{
          code({ children, className, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            return match
              ? (
                  <SyntaxHighlighter
                    {...{ props, ref: undefined }}
                    PreTag="div"
                    children={String(children).replace(/\n$/, '')}
                    language={match ? match[1] : 'typescript'}
                    style={darkTheme ? tomorrow : coy}
                  />
                )
              : (
                  <code {...props} className={className}>
                    {children}
                  </code>
                )
          },
        }}
      />
    )
  }
  return (
    <div
      className="preview-editor"
      data-theme={darkTheme ? 'dark' : 'light'}
    >
      {renderPreviewEditor()}
    </div>
  )
}

export default PreviewEditor
