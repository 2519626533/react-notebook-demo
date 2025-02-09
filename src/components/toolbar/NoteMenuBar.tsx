import type { NoteProps } from '@/types/layout'
import { getNotes, getSettings } from '@/store/selector'
import { togglePreviewMode, toggleThemeMode } from '@/store/setting'
import { downloadMd } from '@/utils/download'
import { CopyOutlined, DeleteOutlined, DownloadOutlined, EditOutlined, EyeOutlined, MoonOutlined, ReloadOutlined, SettingOutlined, StarOutlined, SunOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

const NoteMenuBar: React.FC<NoteProps> = ({ isScratchpad }) => {
  // Selector
  const { scratchpadContent } = useSelector(getNotes)
  const [currentTime, setCurrentTime] = useState(dayjs()) // 实时时间
  const dispatch = useDispatch()
  /**
   * 实时更新时间
   */
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
    downloadMd(scratchpadContent)
  }

  // 切换主题
  const toggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    dispatch(toggleThemeMode())
  }
  return (
    <div className="note-menu-bar" data-theme={darkTheme ? 'dark' : 'light'}>
      <nav>
        <button
          className="note-menu-bar-button"
          data-theme={darkTheme ? 'dark' : 'light'}
          type="button"
          title={isPreviewMode ? 'preview-mode' : 'edit-mode'}
          onClick={toggleMarkdownMode}
        >
          { isPreviewMode ? <EyeOutlined /> : <EditOutlined />}
        </button>
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
        {!isScratchpad && (
          <button
            className="note-menu-bar-button"
            data-theme={darkTheme ? 'dark' : 'light'}
            type="button"
            title="delete"
          >
            <DeleteOutlined />
          </button>
        )}
        <button
          className="note-menu-bar-button"
          data-theme={darkTheme ? 'dark' : 'light'}
          type="button"
          title="download"
        >
          <DownloadOutlined
            onClick={handleDownload}
          />
        </button>
        <button
          className="note-menu-bar-button"
          data-theme={darkTheme ? 'dark' : 'light'}
          type="button"
          title="copy uuid"
        >
          <CopyOutlined />
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
