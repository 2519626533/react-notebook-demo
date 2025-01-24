import type { NoteMenuBarProps } from '@/types/layout'
import { getSettings } from '@/store/selector'
import { togglePreviewMode } from '@/store/setting'
import { CopyOutlined, DeleteOutlined, DownloadOutlined, EditOutlined, EyeOutlined, MoonOutlined, ReloadOutlined, SettingOutlined, StarOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

const NoteMenuBar: React.FC<NoteMenuBarProps> = ({ isNote }) => {
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
  const { isPreviewMode } = useSelector(getSettings)
  const toggleMarkdownMode = () => {
    dispatch(togglePreviewMode())
  }
  return (
    <div className="note-menu-bar">
      <nav>
        <button
          className="note-menu-bar-button"
          type="button"
          title={isPreviewMode ? 'preview-mode' : 'edit-mode'}
          onClick={toggleMarkdownMode}
        >
          { isPreviewMode ? <EyeOutlined /> : <EditOutlined />}
        </button>
        {isNote && (
          <button className="note-menu-bar-button" type="button" title="favorites">
            <StarOutlined />
          </button>
        )}
        {isNote && (
          <button className="note-menu-bar-button" type="button" title="delete">
            <DeleteOutlined />
          </button>
        )}
        <button className="note-menu-bar-button" type="button" title="download">
          <DownloadOutlined />
        </button>
        <button className="note-menu-bar-button" type="button" title="copy uuid">
          <CopyOutlined />
        </button>
      </nav>
      <nav>
        <div className="last-synced">
          {formatTime}
        </div>
        <button className="note-menu-bar-button" type="button" title="refresh">
          <ReloadOutlined />
        </button>
        <button className="note-menu-bar-button" type="button" title="dark">
          <MoonOutlined />
        </button>
        <button className="note-menu-bar-button" type="button" title="settings">
          <SettingOutlined />
        </button>
      </nav>
    </div>
  )
}

export default NoteMenuBar
