import type { NoteProps } from '@/types/layout'
import { deleteNote } from '@/store/note'
import { getNotes, getSettings } from '@/store/selector'
import { togglePreviewMode, toggleThemeMode } from '@/store/setting'
import { downloadMd } from '@/utils/download'
import { copyToClipboard, getActiveNote, getShortUuid } from '@/utils/notes-helps'
import { CopyOutlined, DeleteOutlined, DownloadOutlined, EditOutlined, EyeOutlined, MoonOutlined, ReloadOutlined, SettingOutlined, StarOutlined, SunOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

const NoteMenuBar: React.FC<NoteProps> = ({ isScratchpad }) => {
  // Selector
  const { scratchpadContent, notes, activeNoteId } = useSelector(getNotes)
  const dispatch = useDispatch()
  const activeNote = getActiveNote(notes, activeNoteId)
  /**
   * 实时更新时间
   */
  const [currentTime, setCurrentTime] = useState(dayjs()) // 实时时间
  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(dayjs())
    }, 10000)
    return () => clearInterval(timerId)
  }, [])
  const formatTime = useMemo(() => {
    return currentTime.format('HH:mm on YYYY/MM/DD')
  }, [currentTime])

  /*
  * 切换预览/编辑模式
   */
  const { isPreviewMode, darkTheme } = useSelector(getSettings)
  const toggleMarkdownMode = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    dispatch(togglePreviewMode())
  }
  // 下载任务

  const handleDownload = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (isScratchpad) {
      downloadMd(scratchpadContent, 'ScratchPad')
    } else if (activeNote) {
      downloadMd(activeNote.content, activeNote.title || 'Untitled')
    }
  }

  // 切换主题
  const toggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    dispatch(toggleThemeMode())
  }

  // 点击事件：copy uuid！
  const successfulCopyMessage = 'Note copied!'
  const [uuidCopiedText, setUuidCopiedText] = useState<string>('')
  const shortUuid = getShortUuid(activeNoteId)

  useEffect(() => {
    const timerId = setInterval(() => {
      setUuidCopiedText('')
    }, 3000)

    return () => clearInterval(timerId)
  }, [uuidCopiedText])

  // 将note移入Trash(or delete note)
  const handleDeleteNote = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    dispatch(deleteNote(activeNoteId))
  }

  return (
    <div className="note-menu-bar" data-theme={darkTheme ? 'dark' : 'light'}>
      <nav>
        {/* 切换主题 */}
        <button
          className="note-menu-bar-button"
          data-theme={darkTheme ? 'dark' : 'light'}
          type="button"
          title={isPreviewMode ? 'preview-mode' : 'edit-mode'}
          onClick={toggleMarkdownMode}
        >
          { isPreviewMode ? <EyeOutlined /> : <EditOutlined />}
        </button>
        {/* favorites */}
        {!isScratchpad && (
          <button
            className="note-menu-bar-button"
            data-theme={darkTheme ? 'dark' : 'light'}
            type="button"
            title="favorites"
          >
            <StarOutlined />
          </button>
        )}
        {/* delete */}
        {!isScratchpad && (
          <button
            className="note-menu-bar-button"
            data-theme={darkTheme ? 'dark' : 'light'}
            type="button"
            title="delete"
            onClick={handleDeleteNote}
          >
            <DeleteOutlined />
          </button>
        )}
        {/* download */}
        <button
          className="note-menu-bar-button"
          data-theme={darkTheme ? 'dark' : 'light'}
          type="button"
          title="download"
          onClick={handleDownload}
        >
          <DownloadOutlined />
        </button>
        {/* copy uuid */}
        <button
          className="note-menu-bar-button"
          data-theme={darkTheme ? 'dark' : 'light'}
          type="button"
          title="copy uuid"
          onClick={() => {
            copyToClipboard(`{{${shortUuid}}}`)
            setUuidCopiedText(successfulCopyMessage)
          }}
        >
          <CopyOutlined />
          {uuidCopiedText && <span className="uuid-copy-success">{uuidCopiedText}</span>}
        </button>
      </nav>
      <nav>
        <div
          className="last-synced"
          data-theme={darkTheme ? 'dark' : 'light'}
        >
          {formatTime}
        </div>
        <button
          className="note-menu-bar-button"
          data-theme={darkTheme ? 'dark' : 'light'}
          type="button"
          title="refresh"
        >
          <ReloadOutlined />
        </button>
        <button
          className="note-menu-bar-button"
          data-theme={darkTheme ? 'dark' : 'light'}
          type="button"
          title={darkTheme ? 'dark' : 'light'}
          onClick={toggleTheme}
        >
          {darkTheme ? <SunOutlined /> : <MoonOutlined />}
        </button>
        <button
          className="note-menu-bar-button"
          data-theme={darkTheme ? 'dark' : 'light'}
          type="button"
          title="settings"
        >
          <SettingOutlined />
        </button>
      </nav>
    </div>
  )
}

export default NoteMenuBar
