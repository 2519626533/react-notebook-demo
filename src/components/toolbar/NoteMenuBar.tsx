import type { NoteProps } from '@/types/layout'
import { deleteNote, toggleNoteToFavorite } from '@/store/note'
import { getNotes, getSettings, getSync } from '@/store/selector'
import { togglePreviewMode, toggleThemeMode } from '@/store/setting'
import { sync } from '@/store/sync'
import { emptyElement } from '@/types/components'
import { downloadMd } from '@/utils/download'
import { copyToClipboard, getActiveNote, getScratchpad, getShortUuid } from '@/utils/notes-helps'
import { CopyOutlined, DeleteOutlined, DownloadOutlined, EditOutlined, EyeOutlined, MoonOutlined, ReloadOutlined, SettingOutlined, StarOutlined, SunOutlined } from '@ant-design/icons'
import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import LastSync from '../element/LastSync'

const NoteMenuBar: React.FC<NoteProps> = ({ isScratchpad }) => {
  // Selector
  const { notes, activeNoteId } = useSelector(getNotes)
  const { syncing, lastSynced, pendingSync } = useSelector(getSync)
  const dispatch = useDispatch()

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
    if (activeNote)
      downloadMd(activeNote.content, activeNote.title || 'Untitled')
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

  // Redux事件/点击事件：添加favorite
  const favoriteNoteHandle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    dispatch(toggleNoteToFavorite(activeNoteId))
  }

  // Redux事件/点击事件：移入trash
  const trashNoteHandle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    dispatch(deleteNote(activeNoteId))
  }

  // 点击事件：Sync事件
  const syncHandle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    dispatch(sync({ notes }))
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
            onClick={favoriteNoteHandle}
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
            onClick={trashNoteHandle}
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
        <LastSync
          datetime={lastSynced}
          syncing={syncing}
          pendingSync={pendingSync}
          darkTheme={darkTheme}
        />
        <button
          className="note-menu-bar-button"
          data-theme={darkTheme ? 'dark' : 'light'}
          type="button"
          title="refresh"
          onClick={syncHandle}
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
