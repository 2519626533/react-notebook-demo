import type { NoteProps } from '@/types/layout'
import type { noteItem } from '@/types/slice'
import { setActiveNote, swapFolder } from '@/store/note'
import { getNoteState, getSettings } from '@/store/selector'
import { emptyElement } from '@/types/components'
import { Folder } from '@/utils/enums'
import { getActiveNote, getScratchpad } from '@/utils/notes-helps'
import { uuidPlugin } from '@/utils/reactMarkdownPlugins'
import { slateToMd } from '@/utils/slateToMd'
import { useCallback, useMemo } from 'react'
import Markdown from 'react-markdown'
import { useDispatch, useSelector } from 'react-redux'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { coy, tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism'
import rehypeRaw from 'rehype-raw'
import remarkBreaks from 'remark-breaks'
import remarkGfm from 'remark-gfm'
import NoteLink from '../element/NoteLink'

const PreviewEditor: React.FC<NoteProps> = ({ isScratchpad }) => {
  const dispatch = useDispatch()
  const { notes, activeNoteId } = useSelector(getNoteState)
  const activeNote = useMemo(() => {
    if (isScratchpad) {
      return getScratchpad(notes)
    } else {
      const note = getActiveNote(notes, activeNoteId)
      if (note && (!note.content || note?.content.length === 0)) {
        note.content = [emptyElement]
      }
      return note
    }
  }, [notes, activeNoteId, isScratchpad])

  const value = useMemo(() => {
    return activeNote ? activeNote.content : [emptyElement]
  }, [activeNote])

  const { darkTheme } = useSelector(getSettings)

  const handleNoteLinkClick = useCallback((e: React.SyntheticEvent, note: noteItem) => {
    e.preventDefault()

    if (note) {
      if (note.scratchpad) {
        dispatch(swapFolder({ folder: Folder.SCRATCHPAD }))
      } else if (note.favorite) {
        dispatch(swapFolder({
          folder: Folder.FAVORITES,
          activeNoteId: note.id,
        }))
      }
    }
  }, [dispatch])

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
        remarkPlugins={[uuidPlugin, remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeRaw]}
        components={{
          a({ href, children, ...props }) {
            if (href && href.startsWith('#note://')) {
              const uuid = href.replace('#note://', '')
              return (
                <NoteLink uuid={uuid} notes={notes} handleNoteLinkClick={handleNoteLinkClick} />
              )
            }
            return <a href={href} {...props}>{children}</a>
          },
          code({ children, className, ...props }) {
            // console.log(props)
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
